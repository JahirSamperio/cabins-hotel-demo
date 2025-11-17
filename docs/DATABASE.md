# 🗄️ Base de Datos - Hotel Cabañas

## 📋 Esquema General

Sistema de base de datos PostgreSQL con 4 tablas principales y relaciones bien definidas.

## 🏗️ Diagrama de Entidad-Relación

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │     cabins      │    │  reservations   │
│                 │    │                 │    │                 │
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ user_id (FK)    │
│ password        │    │ capacity        │    │ cabin_id (FK)   │
│ name            │    │ price_per_night │    │ check_in        │
│ phone           │    │ description     │    │ check_out       │
│ is_admin        │    │ images          │    │ guests          │
│ is_guest        │    │ amenities       │    │ total_price     │
│ created_at      │    │ is_active       │    │ status          │
│ updated_at      │    │ created_at      │    │ booking_type    │
└─────────────────┘    │ updated_at      │    │ guest_name      │
                       └─────────────────┘    │ guest_phone     │
                                              │ payment_method  │
                                              │ payment_status  │
                                              │ amount_paid     │
                                              │ includes_breakfast│
                                              │ special_requests│
                                              │ created_at      │
                                              │ updated_at      │
                                              └─────────────────┘
```

---

## 👤 Tabla: users

### **Estructura:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `email` | VARCHAR(255) | Email único del usuario |
| `password` | VARCHAR(255) | Hash de la contraseña (nullable para invitados) |
| `name` | VARCHAR(255) | Nombre completo |
| `phone` | VARCHAR(20) | Teléfono de contacto |
| `is_admin` | BOOLEAN | Si es administrador |
| `is_guest` | BOOLEAN | Si es usuario invitado |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

### **Índices:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);
```

### **Usuarios Especiales:**
```sql
-- Usuario invitado genérico
INSERT INTO users (id, email, name, is_guest) VALUES 
('00000000-0000-0000-0000-000000000001', 'guest@system.local', 'Usuario Invitado', true);
```

---

## 🏠 Tabla: cabins

### **Estructura:**
```sql
CREATE TABLE cabins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
    description TEXT,
    images TEXT, -- JSON array as string
    amenities TEXT, -- JSON array as string
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | VARCHAR(255) | Nombre único de la cabaña |
| `capacity` | INTEGER | Capacidad máxima de huéspedes |
| `price_per_night` | DECIMAL(10,2) | Precio por noche |
| `description` | TEXT | Descripción detallada |
| `images` | TEXT | Array JSON de URLs de imágenes |
| `amenities` | TEXT | Array JSON de amenidades |
| `is_active` | BOOLEAN | Si está activa para reservas |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

### **Ejemplo de Datos:**
```sql
INSERT INTO cabins (name, capacity, price_per_night, description, images, amenities) VALUES 
(
    'Cabaña Rústica',
    4,
    1200.00,
    'Ambiente acogedor para parejas. Chimenea, jacuzzi exterior, desayuno continental...',
    '["https://example.com/image1.jpg", "https://example.com/image2.jpg"]',
    '["Chimenea", "Jacuzzi exterior", "Desayuno incluido", "WiFi gratuito"]'
);
```

### **Índices:**
```sql
CREATE UNIQUE INDEX idx_cabins_name ON cabins(name);
CREATE INDEX idx_cabins_active ON cabins(is_active);
CREATE INDEX idx_cabins_capacity ON cabins(capacity);
```

---

## 🎫 Tabla: reservations

### **Estructura:**
```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    cabin_id UUID NOT NULL REFERENCES cabins(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_type VARCHAR(20) DEFAULT 'online' CHECK (booking_type IN ('online', 'walk_in', 'phone')),
    created_by_admin UUID REFERENCES users(id),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    payment_method VARCHAR(20) DEFAULT 'online' CHECK (payment_method IN ('online', 'cash', 'card', 'transfer')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
    special_requests TEXT,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    includes_breakfast BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT check_dates CHECK (check_out > check_in),
    CONSTRAINT check_amount_paid CHECK (amount_paid >= 0 AND amount_paid <= total_price)
);
```

### **Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | ID del usuario (FK) |
| `cabin_id` | UUID | ID de la cabaña (FK) |
| `check_in` | DATE | Fecha de entrada |
| `check_out` | DATE | Fecha de salida |
| `guests` | INTEGER | Número de huéspedes |
| `total_price` | DECIMAL(10,2) | Precio total |
| `status` | ENUM | Estado de la reserva |
| `booking_type` | ENUM | Tipo de reserva |
| `created_by_admin` | UUID | Admin que creó (para walk-in) |
| `guest_name` | VARCHAR(255) | Nombre del huésped |
| `guest_phone` | VARCHAR(20) | Teléfono del huésped |
| `payment_method` | ENUM | Método de pago |
| `payment_status` | ENUM | Estado del pago |
| `special_requests` | TEXT | Solicitudes especiales |
| `amount_paid` | DECIMAL(10,2) | Monto pagado |
| `includes_breakfast` | BOOLEAN | Incluye desayunador |

### **Valores ENUM:**

#### **status:**
- `pending` - Pendiente de confirmación
- `confirmed` - Confirmada
- `cancelled` - Cancelada
- `completed` - Completada

#### **booking_type:**
- `online` - Reserva online (usuarios e invitados)
- `walk_in` - Reserva presencial (admin)
- `phone` - Reserva por teléfono

#### **payment_method:**
- `online` - Pago online
- `cash` - Efectivo
- `card` - Tarjeta
- `transfer` - Transferencia

#### **payment_status:**
- `pending` - Sin pagar
- `paid` - Pagado completo
- `partial` - Pago parcial

### **Índices:**
```sql
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_cabin_id ON reservations(cabin_id);
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_booking_type ON reservations(booking_type);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);
```

---

## 📅 Tabla: availability (Opcional)

### **Estructura:**
```sql
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cabin_id UUID NOT NULL REFERENCES cabins(id),
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    price_override DECIMAL(10,2),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(cabin_id, date)
);
```

### **Uso:**
- Bloquear fechas específicas
- Precios especiales por fecha
- Mantenimiento de cabañas

---

## 🔗 Relaciones

### **users → reservations (1:N)**
```sql
-- Un usuario puede tener múltiples reservas
SELECT u.name, COUNT(r.id) as total_reservations
FROM users u
LEFT JOIN reservations r ON u.id = r.user_id
GROUP BY u.id, u.name;
```

### **cabins → reservations (1:N)**
```sql
-- Una cabaña puede tener múltiples reservas
SELECT c.name, COUNT(r.id) as total_reservations
FROM cabins c
LEFT JOIN reservations r ON c.id = r.cabin_id
GROUP BY c.id, c.name;
```

---

## 📊 Consultas Útiles

### **Disponibilidad de Cabañas:**
```sql
-- Cabañas disponibles en un rango de fechas
SELECT c.*
FROM cabins c
WHERE c.is_active = true
AND c.id NOT IN (
    SELECT DISTINCT r.cabin_id
    FROM reservations r
    WHERE r.status IN ('pending', 'confirmed')
    AND (
        (r.check_in <= '2024-12-15' AND r.check_out > '2024-12-15') OR
        (r.check_in < '2024-12-17' AND r.check_out >= '2024-12-17') OR
        (r.check_in >= '2024-12-15' AND r.check_out <= '2024-12-17')
    )
);
```

### **Estadísticas de Reservas:**
```sql
-- Estadísticas mensuales
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_reservations,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_price
FROM reservations
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### **Ocupación por Cabaña:**
```sql
-- Tasa de ocupación por cabaña
SELECT 
    c.name,
    COUNT(r.id) as total_reservations,
    SUM(r.check_out::date - r.check_in::date) as total_nights,
    ROUND(AVG(r.total_price), 2) as avg_price
FROM cabins c
LEFT JOIN reservations r ON c.id = r.cabin_id
WHERE r.status IN ('confirmed', 'completed')
GROUP BY c.id, c.name
ORDER BY total_nights DESC;
```

---

## 🔧 Mantenimiento

### **Backup Recomendado:**
```bash
# Backup completo
pg_dump -h localhost -U postgres -d hotel_cabanas > backup_$(date +%Y%m%d).sql

# Backup solo datos
pg_dump -h localhost -U postgres -d hotel_cabanas --data-only > data_backup_$(date +%Y%m%d).sql
```

### **Limpieza de Datos:**
```sql
-- Eliminar reservas canceladas antiguas (más de 1 año)
DELETE FROM reservations 
WHERE status = 'cancelled' 
AND created_at < NOW() - INTERVAL '1 year';

-- Actualizar reservas completadas automáticamente
UPDATE reservations 
SET status = 'completed' 
WHERE status = 'confirmed' 
AND check_out < CURRENT_DATE;
```

### **Optimización:**
```sql
-- Reindexar tablas periódicamente
REINDEX TABLE reservations;
REINDEX TABLE cabins;
REINDEX TABLE users;

-- Analizar estadísticas
ANALYZE reservations;
ANALYZE cabins;
ANALYZE users;
```

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Esquema estable y optimizado