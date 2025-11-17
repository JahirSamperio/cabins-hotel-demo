# 👑 Panel de Administración - Hotel Cabañas

## 📋 Visión General

El panel de administración es una interfaz completa para gestionar todas las operaciones del hotel, desde reservas hasta configuración de cabañas. Diseñado con una arquitectura modular y responsive.

## 🏗️ Arquitectura del Panel

### **Estructura Principal:**
```
src/pages/Admin.jsx                 # Página principal del admin
├── components/admin/
│   ├── Dashboard.jsx              # Dashboard principal
│   ├── Agenda.jsx                 # Calendario y reservas
│   ├── CabinManager.jsx           # Gestión de cabañas
│   ├── ReservationManager.jsx     # Gestión de reservas
│   ├── UserManager.jsx            # Gestión de usuarios
│   └── Settings.jsx               # Configuraciones
└── styles/admin/
    ├── Admin.css                  # Estilos principales
    ├── Dashboard.css              # Estilos del dashboard
    └── Agenda.css                 # Estilos del calendario
```

### **Navegación del Panel:**
```jsx
// Estructura de navegación
const adminSections = [
  { id: 'dashboard', name: 'Dashboard', icon: 'BarChart3' },
  { id: 'agenda', name: 'Agenda', icon: 'Calendar' },
  { id: 'cabins', name: 'Cabañas', icon: 'Home' },
  { id: 'reservations', name: 'Reservas', icon: 'BookOpen' },
  { id: 'users', name: 'Usuarios', icon: 'Users' },
  { id: 'settings', name: 'Configuración', icon: 'Settings' }
]
```

---

## 📊 Módulo 1: Dashboard

### **Componente:** `Dashboard.jsx`

#### **Funcionalidades Principales:**
- ✅ **Métricas en tiempo real**
- ✅ **Gráficos de ocupación**
- ✅ **Resumen financiero**
- ✅ **Alertas y notificaciones**
- ✅ **Accesos rápidos**

#### **Métricas Mostradas:**
```jsx
const dashboardMetrics = {
  totalReservations: 150,        // Total de reservas
  monthlyRevenue: 180000,        // Ingresos del mes
  occupancyRate: 75,             // Tasa de ocupación %
  pendingReservations: 12,       // Reservas pendientes
  monthlyGrowth: 15.5,          // Crecimiento mensual %
  averageStay: 2.3,             // Estadía promedio
  totalGuests: 320,             // Huéspedes totales
  cancelationRate: 8.2          // Tasa de cancelación %
}
```

#### **Widgets del Dashboard:**
1. **Tarjetas de Métricas:**
   ```jsx
   <MetricCard 
     title="Reservas del Mes"
     value={150}
     change={+12}
     icon={<Calendar />}
     color="primary"
   />
   ```

2. **Gráfico de Ocupación:**
   ```jsx
   <OccupancyChart 
     data={occupancyData}
     period="month"
     showComparison={true}
   />
   ```

3. **Lista de Reservas Recientes:**
   ```jsx
   <RecentReservations 
     limit={5}
     showActions={true}
   />
   ```

4. **Alertas del Sistema:**
   ```jsx
   <SystemAlerts 
     alerts={[
       { type: 'warning', message: '3 reservas pendientes de confirmación' },
       { type: 'info', message: 'Mantenimiento programado mañana' }
     ]}
   />
   ```

#### **Acciones Rápidas:**
- 🔄 **Nueva Reserva** - Modal de creación rápida
- 📅 **Ver Agenda** - Navegación directa al calendario
- 🏠 **Agregar Cabaña** - Modal de nueva cabaña
- 📊 **Generar Reporte** - Exportación de datos

---

## 📅 Módulo 2: Agenda

### **Componente:** `Agenda.jsx`

#### **Funcionalidades Principales:**
- ✅ **Calendario mensual interactivo**
- ✅ **Vista de ocupación por cabaña**
- ✅ **Creación de reservas**
- ✅ **Gestión de disponibilidad**
- ✅ **Filtros avanzados**
- ✅ **Exportación de datos**

#### **Vista del Calendario:**
```jsx
// Estructura del calendario
<CalendarView 
  reservations={filteredReservations}
  availability={availability}
  onReservationClick={openReservationModal}
  onNewReservation={openNewReservationModal}
  onAvailabilityClick={handleAvailabilityClick}
  cabinFilter={calendarCabinFilter}
  selectedMonth={selectedMonth}
  selectedYear={selectedYear}
/>
```

#### **Filtros Disponibles:**
```jsx
const agendaFilters = {
  searchTerm: '',              // Búsqueda por nombre/teléfono
  cabinFilter: 'all',          // Filtro por cabaña específica
  statusFilter: 'all',         // Filtro por estado de reserva
  dateRange: 'month',          // Rango de fechas
  paymentStatus: 'all'         // Estado de pago
}
```

#### **Tipos de Reserva en Calendario:**
1. **Reserva Confirmada** - Verde sólido
2. **Reserva Pendiente** - Amarillo rayado
3. **Reserva Cancelada** - Rojo tachado
4. **Disponibilidad Bloqueada** - Gris sólido
5. **Precio Especial** - Azul con símbolo $

#### **Modales de Gestión:**

##### **Modal de Detalles de Reserva:**
```jsx
<ReservationDetailsModal 
  reservation={selectedReservation}
  onClose={closeModal}
  onStatusUpdate={handleStatusUpdate}
  onWhatsAppContact={handleWhatsAppContact}
  onPaymentUpdate={handlePaymentUpdate}
/>
```

##### **Modal de Nueva Reserva:**
```jsx
<NewReservationModal 
  onClose={closeModal}
  onSave={handleSave}
  preselectedCabin={preselectedCabin}
  preselectedDate={preselectedDate}
  actionType="reservation" // o "availability"
/>
```

#### **Exportación de Datos:**
```jsx
const exportOptions = {
  format: 'CSV',               // CSV, Excel, PDF
  dateRange: 'custom',         // week, month, custom
  includeFields: [             // Campos a incluir
    'guest_name', 'cabin', 'dates', 'status', 'payment'
  ],
  filters: activeFilters       // Filtros aplicados
}
```

---

## 🏠 Módulo 3: Gestión de Cabañas

### **Componente:** `CabinManager.jsx`

#### **Funcionalidades Principales:**
- ✅ **CRUD completo de cabañas**
- ✅ **Gestión de imágenes**
- ✅ **Configuración de amenidades**
- ✅ **Precios y disponibilidad**
- ✅ **Estados activo/inactivo**

#### **Lista de Cabañas:**
```jsx
<CabinList 
  cabins={cabins}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
  onViewReservations={handleViewReservations}
/>
```

#### **Formulario de Cabaña:**
```jsx
const cabinFormFields = {
  name: '',                    // Nombre único
  capacity: 1,                 // Capacidad máxima
  price_per_night: 0,          // Precio por noche
  description: '',             // Descripción detallada
  images: [],                  // Array de URLs de imágenes
  amenities: [],               // Array de amenidades
  is_active: true              // Estado activo/inactivo
}
```

#### **Gestión de Imágenes:**
```jsx
<ImageManager 
  images={cabin.images}
  onAdd={handleAddImage}
  onRemove={handleRemoveImage}
  onReorder={handleReorderImages}
  maxImages={10}
/>
```

#### **Amenidades Disponibles:**
```jsx
const availableAmenities = [
  'WiFi gratuito', 'Estacionamiento', 'Cocina completa',
  'Chimenea', 'Jacuzzi exterior', 'Terraza con vista',
  'Desayuno incluido', 'Servicio de limpieza',
  'TV por cable', 'Aire acondicionado', 'Calefacción',
  'Parrilla', 'Jardín privado', 'Acceso a alberca'
]
```

#### **Acciones por Cabaña:**
- ✏️ **Editar** - Modificar información
- 👁️ **Ver Reservas** - Historial de reservas
- 🔄 **Cambiar Estado** - Activar/desactivar
- 📊 **Ver Estadísticas** - Métricas de ocupación
- 🗑️ **Eliminar** - Eliminación con confirmación

---

## 📋 Módulo 4: Gestión de Reservas

### **Componente:** `ReservationManager.jsx`

#### **Funcionalidades Principales:**
- ✅ **Lista completa de reservas**
- ✅ **Filtros avanzados**
- ✅ **Edición de reservas**
- ✅ **Gestión de pagos**
- ✅ **Comunicación con huéspedes**

#### **Lista de Reservas:**
```jsx
<ReservationList 
  reservations={filteredReservations}
  pagination={pagination}
  onEdit={handleEdit}
  onStatusChange={handleStatusChange}
  onPaymentUpdate={handlePaymentUpdate}
  onContact={handleContact}
/>
```

#### **Filtros de Reservas:**
```jsx
const reservationFilters = {
  status: 'all',               // pending, confirmed, cancelled, completed
  paymentStatus: 'all',        // pending, paid, partial
  bookingType: 'all',          // online, walk_in, phone
  dateRange: 'all',            // today, week, month, custom
  cabin: 'all',                // Cabaña específica
  search: ''                   // Búsqueda por nombre/teléfono
}
```

#### **Estados de Reserva:**
1. **Pendiente** 🟡 - Esperando confirmación
2. **Confirmada** 🟢 - Reserva confirmada
3. **Cancelada** 🔴 - Reserva cancelada
4. **Completada** 🔵 - Estadía finalizada

#### **Gestión de Pagos:**
```jsx
<PaymentManager 
  reservation={selectedReservation}
  onUpdate={handlePaymentUpdate}
  allowCustomTotal={true}
  paymentMethods={['cash', 'card', 'transfer', 'online']}
/>
```

#### **Comunicación con Huéspedes:**
```jsx
const contactOptions = {
  whatsapp: {
    enabled: true,
    template: "Hola! Te contacto desde Cabañas Huasca sobre tu reservación..."
  },
  email: {
    enabled: true,
    templates: ['confirmation', 'reminder', 'cancellation']
  },
  sms: {
    enabled: false
  }
}
```

---

## 👥 Módulo 5: Gestión de Usuarios

### **Componente:** `UserManager.jsx`

#### **Funcionalidades Principales:**
- ✅ **Lista de usuarios registrados**
- ✅ **Gestión de roles**
- ✅ **Historial de reservas por usuario**
- ✅ **Estadísticas de usuarios**

#### **Lista de Usuarios:**
```jsx
<UserList 
  users={users}
  onEdit={handleEditUser}
  onViewReservations={handleViewUserReservations}
  onToggleAdmin={handleToggleAdmin}
  onDelete={handleDeleteUser}
/>
```

#### **Tipos de Usuario:**
```jsx
const userTypes = {
  guest: {
    name: 'Invitado',
    color: 'gray',
    permissions: ['view_own_reservations']
  },
  registered: {
    name: 'Registrado',
    color: 'blue',
    permissions: ['create_reservations', 'view_own_reservations', 'edit_profile']
  },
  admin: {
    name: 'Administrador',
    color: 'green',
    permissions: ['all']
  }
}
```

#### **Estadísticas de Usuarios:**
- 📊 **Total de usuarios registrados**
- 📈 **Nuevos registros del mes**
- 🎯 **Tasa de conversión** (invitados → registrados)
- 💰 **Valor promedio por usuario**
- 🔄 **Usuarios recurrentes**

---

## ⚙️ Módulo 6: Configuraciones

### **Componente:** `Settings.jsx`

#### **Configuraciones Disponibles:**

##### **Configuración General:**
```jsx
const generalSettings = {
  hotelName: 'Cabañas Huasca',
  contactPhone: '55 1234 5678',
  contactEmail: 'info@cabanashuasca.com',
  address: 'Huasca de Ocampo, Hidalgo',
  checkInTime: '15:00',
  checkOutTime: '12:00',
  currency: 'MXN',
  timezone: 'America/Mexico_City'
}
```

##### **Configuración de Precios:**
```jsx
const pricingSettings = {
  breakfastPrice: 150,         // Precio por persona por noche
  taxRate: 16,                 // IVA %
  seasonalRates: {
    high: 1.3,                 // Temporada alta +30%
    low: 0.8                   // Temporada baja -20%
  },
  discounts: {
    earlyBird: 10,             // Reserva anticipada
    longStay: 15               // Estadía larga (7+ noches)
  }
}
```

##### **Configuración de Notificaciones:**
```jsx
const notificationSettings = {
  email: {
    newReservation: true,
    cancellation: true,
    paymentReceived: true,
    reminderBeforeArrival: true
  },
  whatsapp: {
    confirmationMessage: true,
    reminderMessage: true,
    customTemplate: "Gracias por elegir Cabañas Huasca..."
  }
}
```

##### **Configuración de Disponibilidad:**
```jsx
const availabilitySettings = {
  advanceBookingDays: 365,     // Días máximos de anticipación
  minimumStay: 1,              // Noches mínimas
  maximumStay: 30,             // Noches máximas
  blackoutDates: [],           // Fechas bloqueadas
  maintenanceDays: []          // Días de mantenimiento
}
```

---

## 🎨 Diseño y UX del Panel

### **Paleta de Colores:**
```css
:root {
  --admin-primary: #2c5530;     /* Verde principal */
  --admin-secondary: #8b4513;   /* Marrón secundario */
  --admin-success: #28a745;     /* Verde éxito */
  --admin-warning: #ffc107;     /* Amarillo advertencia */
  --admin-danger: #dc3545;      /* Rojo peligro */
  --admin-info: #17a2b8;        /* Azul información */
  --admin-light: #f8f9fa;       /* Gris claro */
  --admin-dark: #343a40;        /* Gris oscuro */
}
```

### **Layout Responsive:**
```css
/* Desktop: Sidebar + Content */
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

/* Tablet: Collapsible sidebar */
@media (max-width: 1024px) {
  .admin-layout {
    grid-template-columns: 60px 1fr;
  }
}

/* Mobile: Bottom navigation */
@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 60px;
  }
}
```

### **Componentes UI Reutilizables:**

#### **Tarjetas de Métricas:**
```jsx
<MetricCard 
  title="Total Reservas"
  value={150}
  change={+12}
  period="vs mes anterior"
  icon={<Calendar />}
  color="primary"
  loading={false}
/>
```

#### **Tablas de Datos:**
```jsx
<DataTable 
  data={reservations}
  columns={reservationColumns}
  pagination={true}
  sorting={true}
  filtering={true}
  actions={['edit', 'delete', 'view']}
  onAction={handleTableAction}
/>
```

#### **Modales Reutilizables:**
```jsx
<Modal 
  isOpen={showModal}
  onClose={closeModal}
  title="Título del Modal"
  size="large"
  actions={[
    { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
    { label: 'Guardar', variant: 'primary', onClick: handleSave }
  ]}
>
  {/* Contenido del modal */}
</Modal>
```

---

## 🔐 Seguridad y Permisos

### **Control de Acceso:**
```jsx
const permissions = {
  dashboard: ['admin'],
  agenda: ['admin'],
  cabins: ['admin'],
  reservations: ['admin'],
  users: ['admin'],
  settings: ['admin']
}

// Middleware de verificación
const requireAdmin = (component) => {
  return user?.is_admin ? component : <Unauthorized />
}
```

### **Validaciones de Seguridad:**
- ✅ **JWT Token** verificado en cada request
- ✅ **Rol de admin** requerido para acceso
- ✅ **Rate limiting** en acciones críticas
- ✅ **Logs de auditoría** para cambios importantes
- ✅ **Validación de inputs** en todos los formularios

---

## 📱 Responsive Design

### **Adaptaciones por Dispositivo:**

#### **Desktop (1024px+):**
- Sidebar completo visible
- Tablas con todas las columnas
- Modales de tamaño completo
- Gráficos interactivos

#### **Tablet (768px - 1024px):**
- Sidebar colapsado con iconos
- Tablas con scroll horizontal
- Modales adaptados
- Gráficos simplificados

#### **Mobile (< 768px):**
- Navegación inferior
- Cards en lugar de tablas
- Modales de pantalla completa
- Métricas apiladas verticalmente

---

## 🚀 Performance y Optimización

### **Estrategias Implementadas:**
- ✅ **Lazy loading** de módulos
- ✅ **Paginación** en listas grandes
- ✅ **Debounce** en búsquedas
- ✅ **Memoización** de componentes pesados
- ✅ **Virtual scrolling** para listas muy largas

### **Métricas de Performance:**
- **Tiempo de carga inicial:** < 3 segundos
- **Tiempo de navegación:** < 500ms
- **Tiempo de respuesta API:** < 1 segundo
- **Bundle size:** < 500KB (gzipped)

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Panel completo y funcional