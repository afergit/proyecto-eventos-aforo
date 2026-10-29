import type { EventEntity, TicketEntity, EventRepository } from '../../domain/repositories/eventRepository';

/**
 * Adaptador de repositorio en memoria con soporte de Optimistic Locking.
 * Simula el comportamiento ACID y la cláusula:
 * UPDATE events SET available_tickets = available_tickets - 1, version = version + 1
 * WHERE id = $id AND version = $expectedVersion;
 */
export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, EventEntity> = new Map();
  private tickets: Map<string, TicketEntity> = new Map();

  async seed(event: EventEntity) {
    this.events.set(event.id, { ...event });
  }

  async findById(id: string): Promise<EventEntity | null> {
    const event = this.events.get(id);
    return event ? { ...event } : null;
  }

  async save(event: EventEntity): Promise<void> {
    this.events.set(event.id, { ...event });
  }

  async createTicket(ticket: TicketEntity): Promise<void> {
    this.tickets.set(ticket.id, { ...ticket });
  }

  async getTicketsByEvent(eventId: string): Promise<TicketEntity[]> {
    return Array.from(this.tickets.values()).filter(t => t.eventId === eventId);
  }

  /**
   * Ejecución atómica de Optimistic Concurrency Control (OCC).
   * Si la versión esperada difiere de la versión persistida actual,
   * se detecta colisión concurrente (Race Condition) y se aborta la mutación.
   */
  async updateEventOptimistic(event: EventEntity, expectedVersion: number): Promise<boolean> {
    const current = this.events.get(event.id);
    if (!current) {
      return false;
    }

    if (current.version !== expectedVersion) {
      // Conflicto de versión detectado: otro hilo/proceso modificó el registro antes
      return false;
    }

    // Mutación atómica
    this.events.set(event.id, {
      ...event,
      version: current.version + 1
    });

    return true;
  }
}
