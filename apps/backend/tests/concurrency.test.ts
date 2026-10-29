import { describe, expect, it, beforeEach } from 'bun:test';
import { InMemoryEventRepository } from '../src/infrastructure/database/inMemoryEventRepository';
import { PurchaseTicketUseCase, SoldOutError } from '../src/application/use-cases/purchaseTicketUseCase';

describe('Fase 3: Core Transaccional y Control de Concurrencia (Race Conditions)', () => {
  let eventRepo: InMemoryEventRepository;
  let purchaseUseCase: PurchaseTicketUseCase;

  const testEvent = {
    id: 'evt_concurrency_01',
    organizerId: 'org_001',
    title: 'Concierto Masivo TICS316',
    totalCapacity: 50,
    currentCapacity: 0,
    availableTickets: 5, // Inventario limitado para forzar colisiones
    ticketPrice: 120.0,
    version: 1,
    status: 'PUBLISHED' as const
  };

  beforeEach(async () => {
    eventRepo = new InMemoryEventRepository();
    await eventRepo.seed(testEvent);
    purchaseUseCase = new PurchaseTicketUseCase(eventRepo);
  });

  it('Debe decrementar el inventario y crear un ticket con éxito en una compra normal', async () => {
    // Arrange
    const buyerId = 'usr_buyer_single';

    // Act
    const result = await purchaseUseCase.execute({
      eventId: testEvent.id,
      buyerId
    });

    // Assert
    expect(result.ticket.ownerId).toBe(buyerId);
    expect(result.event.availableTickets).toBe(4);
    expect(result.event.version).toBe(2);
  });

  it('Debe rechazar compras cuando las entradas están completamente agotadas (SoldOutError)', async () => {
    // Arrange: evento con 0 tickets
    await eventRepo.seed({
      ...testEvent,
      id: 'evt_sold_out',
      availableTickets: 0
    });

    // Act & Assert
    expect(
      purchaseUseCase.execute({ eventId: 'evt_sold_out', buyerId: 'usr_too_late' })
    ).rejects.toThrow(SoldOutError);
  });

  it('Debe resolver Race Conditions: 10 solicitudes concurrentes compitiendo por 5 tickets evitan la sobreventa', async () => {
    // Arrange: 10 compradores simultáneos para solo 5 tickets disponibles
    const buyerIds = Array.from({ length: 10 }, (_, i) => `buyer_${i + 1}`);

    // Act: Lanzar todas las solicitudes en paralelo sin esperarse unas a otras
    const results = await Promise.allSettled(
      buyerIds.map(id => purchaseUseCase.execute({ eventId: testEvent.id, buyerId: id, maxRetries: 5 }))
    );

    const successfulPurchases = results.filter(r => r.status === 'fulfilled');
    const failedPurchases = results.filter(r => r.status === 'rejected');

    // Assert: Cero sobreventa garantizada (Exactamente 5 vendidas)
    expect(successfulPurchases.length).toBe(5);
    expect(failedPurchases.length).toBe(5);

    // Verificar estado final en BD
    const finalEvent = await eventRepo.findById(testEvent.id);
    expect(finalEvent?.availableTickets).toBe(0);

    const issuedTickets = await eventRepo.getTicketsByEvent(testEvent.id);
    expect(issuedTickets.length).toBe(5);
  });
});
