import express from 'express';
import { consultarDisponibilidad } from '../controllers/availability.js';
import { getAvailabilityByRange, setAvailability, setBulkAvailability, deleteAvailability } from '../controllers/availabilityAdmin.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Ruta pública para consultar disponibilidad
router.get('/check', consultarDisponibilidad);

// Rutas administrativas (requieren autenticación y permisos de admin)
router.get('/admin/range', [validarJWT, validarAdmin], getAvailabilityByRange);
router.post('/admin/set', [validarJWT, validarAdmin], setAvailability);
router.post('/admin/bulk', [validarJWT, validarAdmin], setBulkAvailability);
router.delete('/admin/:id', [validarJWT, validarAdmin], deleteAvailability);

export default router;