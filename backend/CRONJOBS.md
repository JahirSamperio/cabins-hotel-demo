# Sistema de Cronjobs - Hotel Cabañas

## Descripción
Este sistema automatiza la actualización de estados de reservaciones basándose en las fechas de checkout.

## Funcionalidad Principal

### Actualización Automática de Estados
- **Frecuencia**: Todos los días a las 00:01 (medianoche)
- **Zona horaria**: America/Mexico_City
- **Acción**: Cambia el estado de reservaciones de `confirmed` a `completed` cuando la fecha de checkout ha pasado

### Lógica de Actualización
```javascript
// Busca reservaciones con:
// - status: 'confirmed'
// - check_out < fecha_actual
// 
// Las actualiza a:
// - status: 'completed'
```

## Archivos Involucrados

### `/src/services/cronJobs.js`
- `actualizarEstadosReservaciones()`: Función principal que actualiza los estados
- `inicializarCronJobs()`: Inicializa todos los cronjobs del sistema

### `/src/controllers/cronJobs.js`
- `ejecutarActualizacionManual()`: Permite ejecutar manualmente la actualización

### `/src/routes/cronJobs.js`
- `POST /api/cron/actualizar-estados`: Endpoint para ejecución manual (solo administradores)

## Uso Manual

### Ejecutar Actualización Manual
```bash
POST /api/cron/actualizar-estados
Headers:
  x-token: [JWT_TOKEN_ADMIN]
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "msg": "Actualización completada. 3 reservaciones actualizadas a 'completed'",
  "actualizadas": 3
}
```

## Logs del Sistema
El sistema genera logs informativos:
- `[CRON] X reservaciones actualizadas a 'completed'`
- `[CRON] Reservación [ID] actualizada: checkout [FECHA] -> completed`
- `[CRON] No hay reservaciones para actualizar`

## Configuración
- La zona horaria se puede cambiar en el parámetro `timezone` del cron.schedule
- La frecuencia se puede modificar cambiando el patrón cron `'1 0 * * *'`

## Dependencias
- `node-cron`: Para la programación de tareas
- `sequelize`: Para las consultas a la base de datos