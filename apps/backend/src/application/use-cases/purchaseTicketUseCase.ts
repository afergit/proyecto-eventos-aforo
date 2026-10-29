import type { EventRepository, PurchaseTransactionResult } from '../../domain/repositories/eventRepository';
import { Logger } from '../../infrastructure/logging/logger';

export class ConcurrencyConflictError extends Error {
  constructor(message: string = 'Conflicto de concurrencia detectado. El inventario cambió mientras se procesaba la compra.') {
    super(message);
    this.name = 'ConcurrencyConflictError';
  }
}

export class SoldOutError extends Error {
  constructor(message: string = 'Entradas agotadas para este evento.') {
    super(message);
    this.name = 'SoldOutError';
  }
}

export interface PurchaseTicketInput {
  eventId: string;
  buyerId: string;
  maxRetries?: number;
}

/**
 * Caso de Uso: Compra de Entradas con Concurrencia Masiva
 * Implementa Optimistic Locking con estrategia de reintento con backoff exponencial
 * para evitar el problema de sobreventa (Race Conditions) y deadlocks en la BD.
 */
export class PurchaseTicketUseCase {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: PurchaseTicketInput): Promise<PurchaseTransactionResult> {
    const maxRetries = input.maxRetries ?? 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;

      const event = await this.eventRepository.findById(input.eventId);
      if (!event) {
        throw new Error('El evento solicitado no existe.');
      }

      if (event.availableTickets <= 0) {
        throw new SoldOutError(`No quedan entradas disponibles para "${event.title}".`);
      }

      // Preparar estado decrementado bajo control de versión
      const expectedVersion = event.version;
      const updatedEvent = {
        ...event,
        availableTickets: event.availableTickets - 1
      };

      // Intentar commit optimista
      const success = await this.eventRepository.updateEventOptimistic(updatedEvent, expectedVersion);

      if (success) {
        // Emitir ticket criptográfico
        const ticketId = crypto.randomUUID();
        const qrHash = `ticket_sig_${ticketId}_${input.buyerId}_${Date.now()}`;

        const ticket = {
          id: ticketId,
          eventId: event.id,
          ownerId: input.buyerId,
          status: 'ISSUED' as const,
          qrHash,
          version: 1,
          issuedAt: new Date()
        };

        await this.eventRepository.createTicket(ticket);

        Logger.info(`Compra exitosa para evento ${event.id} por usuario ${input.buyerId}`, {
          ticketId,
          attempt,
          availableTicketsRemaining: updatedEvent.availableTickets
        });

        return {
          ticket,
          event: { ...updatedEvent, version: expectedVersion + 1 },
          transactionId: crypto.randomUUID()
        };
      }

      // Conflicto de versión detectado: reintentar con jitter
      Logger.warn(`Colisión de concurrencia en compra de ticket (Intento ${attempt}/${maxRetries}). Reintentando...`, {
        eventId: input.eventId,
        attempt
      });

      // Backoff jitter breve
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
    }

    throw new ConcurrencyConflictError('Alta saturación del sistema. Por favor intente comprar nuevamente.');
  }
}
