import type { EventEntity, TicketEntity } from './eventRepository';

export interface ResaleResult {
  revokedTicket: TicketEntity;
  newTicket: TicketEntity;
  transactionId: string;
}

export interface TicketRepository {
  findById(id: string): Promise<TicketEntity | null>;
  findByQrHash(qrHash: string): Promise<TicketEntity | null>;
  save(ticket: TicketEntity): Promise<void>;
  /**
   * Ejecución atómica de reventa:
   * 1. Invalida y revoca el ticket del vendedor (status = 'TRANSFERRED')
   * 2. Emite un nuevo ticket con QR criptográfico único para el comprador
   * Garantiza que el ticket original quede inservible permanentemente.
   */
  transferTicketAtomic(sellerTicketId: string, newTicket: TicketEntity): Promise<ResaleResult>;
}
