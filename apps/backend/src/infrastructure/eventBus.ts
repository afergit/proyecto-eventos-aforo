import { EventEmitter } from 'node:events';

/**
 * EventBus singleton used across the backend to emit internal domain events.
 * In production we could replace this with Redis Pub/Sub for horizontal scaling.
 */
export const EventBus = new EventEmitter();

export type BackendEvent =
  | { type: 'TICKET_SCANNED'; payload: { eventId: string; ticketId: string; usedAt: Date; currentCapacity: number } };

export const emitEvent = (event: BackendEvent) => {
  EventBus.emit(event.type, event.payload);
};

export const onEvent = <T extends BackendEvent['type']>(type: T, listener: (payload: Extract<BackendEvent, { type: T }>['payload']) => void) => {
  EventBus.on(type, listener as any);
};
