-- ====================================================================
-- ESQUEMA TRANSACCIONAL DE CORE: VENTA, REVENTA Y CONTROL DE AFORO
-- Optimizado para PostgreSQL 15+ con integridad referencial ACID
-- ====================================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'ORGANIZER', 'ATTENDEE', 'STAFF')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Eventos con Control de Concurrencia (version para Optimistic Locking)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    venue VARCHAR(200) NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    current_capacity INTEGER NOT NULL DEFAULT 0 CHECK (current_capacity >= 0),
    available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
    ticket_price DECIMAL(10, 2) NOT NULL CHECK (ticket_price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    version INTEGER NOT NULL DEFAULT 1, -- Clave para Optimistic Concurrency Control (OCC)
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_capacity_limit CHECK (current_capacity <= total_capacity),
    CONSTRAINT chk_tickets_limit CHECK (available_tickets <= total_capacity)
);

-- 3. Tabla de Entradas (Tickets) con estado atómico
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'USED', 'TRANSFERRED', 'REVOKED')),
    qr_hash TEXT UNIQUE NOT NULL,
    resale_price DECIMAL(10, 2) DEFAULT NULL,
    is_for_resale BOOLEAN NOT NULL DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Transacciones y Órdenes de Compra (Auditoría)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES users(id) ON DELETE RESTRICT, -- NULL en venta primaria
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('PRIMARY_PURCHASE', 'RESALE_TRANSFER')),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices estratégicos para alta concurrencia
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_hash ON tickets(qr_hash);
