# 🔧 Troubleshooting - Hotel Cabañas

## 🚨 Problemas Comunes y Soluciones

### 🔄 **Problemas de Navegación**

#### **Problema:** Los botones de cabañas no navegan
**Síntomas:**
- Click en "Ver Detalles" no hace nada
- URL no cambia
- Consola muestra logs pero no navegación

**Soluciones:**
1. **Verificar React Router:**
   ```jsx
   // Asegurar que el componente esté dentro de Router
   <BrowserRouter>
     <ComponenteConNavegacion />
   </BrowserRouter>
   ```

2. **Usar useNavigate correctamente:**
   ```jsx
   import { useNavigate } from 'react-router-dom'
   
   const navigate = useNavigate()
   const handleClick = () => navigate('/ruta')
   ```

3. **Verificar rutas en App.jsx:**
   ```jsx
   <Route path="/cabana/:id" element={<CabanaDetailPage />} />
   ```

---

### 🗄️ **Problemas de Base de Datos**

#### **Problema:** Error de constraint en reservations
**Error:** `reservations_booking_type_check`

**Causa:** Valor no válido en campo ENUM

**Solución:**
```javascript
// Usar solo valores válidos
booking_type: 'online' // ✅ Válido
booking_type: 'guest_online' // ❌ Inválido
```

**Valores válidos:**
- `booking_type`: `'online'`, `'walk_in'`, `'phone'`
- `payment_method`: `'online'`, `'cash'`, `'card'`, `'transfer'`
- `status`: `'pending'`, `'confirmed'`, `'cancelled'`, `'completed'`

#### **Problema:** Error de checkbox boolean
**Error:** Campo recibe `'on'` en lugar de `true/false`

**Solución:**
```jsx
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target
  const inputValue = type === 'checkbox' ? checked : value
  setFormData(prev => ({ ...prev, [name]: inputValue }))
}
```

---

### 🔐 **Problemas de Autenticación**

#### **Problema:** Token no válido
**Síntomas:**
- Error 401 en requests
- Usuario deslogueado automáticamente

**Soluciones:**
1. **Verificar token en localStorage:**
   ```javascript
   const token = localStorage.getItem('token')
   console.log('Token:', token)
   ```

2. **Verificar headers:**
   ```javascript
   headers: {
     'x-token': token,
     'Content-Type': 'application/json'
   }
   ```

3. **Manejar expiración:**
   ```javascript
   if (response.status === 401) {
     localStorage.removeItem('token')
     navigate('/login')
   }
   ```

#### **Problema:** CORS errors
**Error:** `Access-Control-Allow-Origin`

**Solución en backend:**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
```

---

### 📡 **Problemas de API**

#### **Problema:** Failed to fetch
**Síntomas:**
- Requests fallan sin respuesta
- Error de red en consola

**Soluciones:**
1. **Verificar servidor backend:**
   ```bash
   cd backend
   npm run dev
   # Verificar que corra en puerto 3000
   ```

2. **Verificar URL de API:**
   ```javascript
   // En .env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Verificar proxy en Vite:**
   ```javascript
   // vite.config.js
   server: {
     proxy: {
       '/api': 'http://localhost:3000'
     }
   }
   ```

#### **Problema:** Timeout en requests
**Síntomas:**
- Requests muy lentos
- Timeout errors

**Soluciones:**
1. **Agregar timeout:**
   ```javascript
   const timeoutPromise = new Promise((_, reject) => 
     setTimeout(() => reject(new Error('Timeout')), 10000)
   )
   
   const response = await Promise.race([
     fetch('/api/endpoint'),
     timeoutPromise
   ])
   ```

2. **Optimizar queries:**
   ```javascript
   // Limitar resultados
   const reservations = await Reservation.findAll({
     limit: 100,
     include: [/* solo campos necesarios */]
   })
   ```

---

### 🎨 **Problemas de Estilos**

#### **Problema:** Estilos no se aplican
**Síntomas:**
- Componentes sin estilos
- Layout roto

**Soluciones:**
1. **Verificar imports:**
   ```jsx
   import './Component.css'
   ```

2. **Verificar especificidad CSS:**
   ```css
   /* Más específico */
   .component.active { }
   
   /* Usar !important solo si es necesario */
   .component { color: red !important; }
   ```

3. **Verificar variables CSS:**
   ```css
   :root {
     --primary-color: #2c5530;
   }
   ```

#### **Problema:** Responsive no funciona
**Síntomas:**
- Layout roto en móvil
- Media queries no aplican

**Soluciones:**
1. **Verificar viewport meta:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Mobile-first approach:**
   ```css
   /* Base: Mobile */
   .component { width: 100%; }
   
   /* Desktop */
   @media (min-width: 768px) {
     .component { width: 50%; }
   }
   ```

---

### ⚡ **Problemas de Performance**

#### **Problema:** Página lenta
**Síntomas:**
- Carga inicial lenta
- Navegación lenta

**Soluciones:**
1. **Implementar lazy loading:**
   ```jsx
   const ComponentePesado = lazy(() => import('./ComponentePesado'))
   ```

2. **Optimizar imágenes:**
   ```jsx
   <LazyImage 
     src="imagen-optimizada.webp"
     loading="lazy"
   />
   ```

3. **Memoizar componentes:**
   ```jsx
   const ComponenteOptimizado = memo(Component)
   ```

#### **Problema:** Bundle muy grande
**Síntomas:**
- Build lento
- Archivos JS grandes

**Soluciones:**
1. **Code splitting:**
   ```jsx
   const AdminPage = lazy(() => import('./pages/Admin'))
   ```

2. **Analizar bundle:**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

---

### 🔄 **Problemas de Estado**

#### **Problema:** Estado no se actualiza
**Síntomas:**
- UI no refleja cambios
- Datos desactualizados

**Soluciones:**
1. **Verificar mutación directa:**
   ```javascript
   // ❌ Incorrecto
   state.items.push(newItem)
   
   // ✅ Correcto
   setState(prev => [...prev, newItem])
   ```

2. **Usar useEffect correctamente:**
   ```jsx
   useEffect(() => {
     loadData()
   }, [dependency]) // Agregar dependencias
   ```

#### **Problema:** Re-renders excesivos
**Síntomas:**
- Componente se renderiza muchas veces
- Performance degradada

**Soluciones:**
1. **Usar useCallback:**
   ```jsx
   const handleClick = useCallback(() => {
     doSomething(id)
   }, [id])
   ```

2. **Usar useMemo:**
   ```jsx
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data)
   }, [data])
   ```

---

### 📱 **Problemas Específicos de Móvil**

#### **Problema:** Touch events no funcionan
**Síntomas:**
- Botones no responden en móvil
- Gestos no funcionan

**Soluciones:**
1. **Agregar touch-action:**
   ```css
   .button {
     touch-action: manipulation;
   }
   ```

2. **Verificar tamaño de touch targets:**
   ```css
   .button {
     min-height: 44px;
     min-width: 44px;
   }
   ```

#### **Problema:** Viewport issues
**Síntomas:**
- Zoom inesperado
- Layout cortado

**Soluciones:**
1. **Configurar viewport:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
   ```

2. **Evitar overflow horizontal:**
   ```css
   body {
     overflow-x: hidden;
   }
   ```

---

## 🛠️ **Herramientas de Debug**

### **React Developer Tools**
```javascript
// Instalar extensión de navegador
// Inspeccionar componentes y estado
```

### **Network Tab**
```javascript
// Verificar requests
// Analizar tiempos de respuesta
// Revisar headers y payloads
```

### **Console Debugging**
```javascript
// Logs útiles
console.log('Estado actual:', state)
console.table(arrayData)
console.error('Error:', error)

// Breakpoints
debugger; // Pausa ejecución
```

### **Database Debugging**
```sql
-- Verificar datos
SELECT * FROM reservations WHERE status = 'pending';

-- Verificar constraints
\d+ reservations

-- Ver logs de PostgreSQL
tail -f /var/log/postgresql/postgresql.log
```

---

## 📋 **Checklist de Debugging**

### **Antes de reportar un bug:**
- [ ] ¿Está el servidor backend corriendo?
- [ ] ¿Hay errores en la consola del navegador?
- [ ] ¿Están las variables de entorno configuradas?
- [ ] ¿Funciona en modo incógnito?
- [ ] ¿Se reproduce en diferentes navegadores?
- [ ] ¿Hay datos de prueba en la base de datos?

### **Para problemas de performance:**
- [ ] ¿Hay componentes sin memoizar?
- [ ] ¿Se están cargando imágenes innecesarias?
- [ ] ¿Hay queries N+1 en el backend?
- [ ] ¿Está habilitada la compresión?
- [ ] ¿Se está usando lazy loading?

### **Para problemas de UI:**
- [ ] ¿Están importados los estilos CSS?
- [ ] ¿Hay conflictos de especificidad?
- [ ] ¿Funciona en diferentes tamaños de pantalla?
- [ ] ¿Están definidas las variables CSS?
- [ ] ¿Hay elementos con z-index conflictivos?

---

## 📞 **Contacto para Soporte**

Si ninguna de estas soluciones funciona:

1. **Revisar logs del servidor**
2. **Crear issue con información detallada:**
   - Pasos para reproducir
   - Errores de consola
   - Screenshots si aplica
   - Versión del navegador
   - Sistema operativo

3. **Incluir información del entorno:**
   - Node.js version
   - npm/yarn version
   - Variables de entorno (sin datos sensibles)

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Guía completa de troubleshooting