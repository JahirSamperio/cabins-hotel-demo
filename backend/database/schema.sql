-- Base de datos para Sistema de Cabañas Huasca (PostgreSQL)
-- Crear y conectar a la base de datos
CREATE DATABASE cabanas_demo;
\c cabanas_demo;

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cabañas
CREATE TABLE cabins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservaciones
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    cabin_id UUID NOT NULL REFERENCES cabins(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_type VARCHAR(20) DEFAULT 'online' CHECK (booking_type IN ('online', 'walk_in', 'phone')),
    created_by_admin UUID REFERENCES users(id),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    payment_method VARCHAR(20) DEFAULT 'online' CHECK (payment_method IN ('online', 'cash', 'card', 'transfer')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de disponibilidad
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cabin_id UUID NOT NULL REFERENCES cabins(id),
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    price_override DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cabin_id, date)
);

-- Tabla de reviews/testimonios
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    reservation_id UUID REFERENCES reservations(id),
    cabin_id UUID REFERENCES cabins(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales
-- Usuario invitado para reservaciones presenciales
INSERT INTO users (id, email, name, is_admin, is_guest) 
VALUES ('00000000-0000-0000-0000-000000000001', 'invitado@sistema.local', 'Invitado', FALSE, TRUE);

-- Usuario administrador
INSERT INTO users (id, email, password, name, is_admin) 
VALUES ('00000000-0000-0000-0000-000000000002', 'admin@cabanashuasca.com', '$2b$10$hashedpassword', 'Administrador', TRUE);

-- Cabañas iniciales
INSERT INTO cabins (id, name, capacity, price_per_night, description, is_active) VALUES
('00000000-0000-0000-0000-000000000003', 'Cabaña Familiar', 6, 1200.00, 'Hasta 6 personas • Cocina equipada • Chimenea • Vista al bosque', TRUE),
('00000000-0000-0000-0000-000000000004', 'Cabaña Romántica', 2, 900.00, 'Para 2 personas • Jacuzzi privado • Terraza • Desayuno incluido', TRUE),
('00000000-0000-0000-0000-000000000005', 'Cabaña Premium', 8, 1800.00, 'Hasta 8 personas • 3 recámaras • Asador • Área de juegos', TRUE);

-- Índices para optimización
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_cabin ON availability(cabin_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_cabin ON reviews(cabin_id);