export interface EventEntity {
  id: string;
  organizerId: string;
  title: string;
  totalCapacity: number;
  currentCapacity: number;
  availableTickets: number;
  ticketPrice: number;
  version: number; // Optimistic locking
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface TicketEntity {
  id: string;
  eventId: string;
  ownerId: string;
  status: 'ISSUED' | 'USED' | 'TRANSFERRED' | 'REVOKED';
  qrHash: string;
  version: number;
  issuedAt: Date;
}

export interface PurchaseTransactionResult {
  ticket: TicketEntity;
  event: EventEntity;
  transactionId: string;
}

export interface EventRepository {
  findById(id: string): Promise<EventEntity | null>;
  save(event: EventEntity): Promise<void>;
  createTicket(ticket: TicketEntity): Promise<void>;
  updateEventOptimistic(event: EventEntity, expectedVersion: number): Promise<boolean>;
}
