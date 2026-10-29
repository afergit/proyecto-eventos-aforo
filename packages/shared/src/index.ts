import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'ORGANIZER', 'ATTENDEE', 'STAFF']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: UserRoleSchema,
  createdAt: z.date()
});
export type User = z.infer<typeof UserSchema>;

export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  totalCapacity: z.number().int().positive(),
  currentCapacity: z.number().int().nonnegative(),
  status: EventStatusSchema,
  startDate: z.date(),
  endDate: z.date()
});
export type Event = z.infer<typeof EventSchema>;

export const TicketStatusSchema = z.enum(['ISSUED', 'USED', 'TRANSFERRED', 'REVOKED']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const TicketSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  ownerId: z.string().uuid(),
  status: TicketStatusSchema,
  qrHash: z.string(),
  issuedAt: z.date(),
  usedAt: z.date().optional()
});
export type Ticket = z.infer<typeof TicketSchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.string()
  });
