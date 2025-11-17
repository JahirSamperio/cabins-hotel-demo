import express from 'express';
import rateLimit from 'express-rate-limit';
import { crearReservacion, crearReservacionWalkIn, obtenerReservaciones, obtenerReservacion, actualizarReservacion, obtenerReservacionesPorRango, crearReservacionInvitado } from '../controllers/reservations.js';
import { crearReservacionValidators, crearReservacionWalkInValidators, actualizarReservacionValidators } from '../middlewares/validators/reservations.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';
import { validateGuestReservation, detectSuspiciousActivity } from '../middlewares/validators/guestValidation.js';

const router = express.Router();

// Rate limiting para reservas de invitados
const guestReservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 reservas por IP cada 15 min
  message: {
    ok: false,
    msg: 'Demasiadas reservas desde esta IP. Intenta en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress
  }
});

// Rutas de usuario autenticado
router.post('/', [validarJWT, ...crearReservacionValidators], crearReservacion);
router.get('/', validarJWT, obtenerReservaciones);
router.get('/range', validarJWT, obtenerReservacionesPorRango);
router.get('/:id', validarJWT, obtenerReservacion);
router.put('/:id', [validarJWT, ...actualizarReservacionValidators], actualizarReservacion);

// Rutas de administrador
router.post('/walk-in', [validarJWT, validarAdmin, ...crearReservacionWalkInValidators], crearReservacionWalkIn);

// Ruta pública para reservas de invitados con seguridad completa
router.post('/guest', [
    guestReservationLimiter,
    validateGuestReservation,
    detectSuspiciousActivity
], crearReservacionInvitado);

export default router;