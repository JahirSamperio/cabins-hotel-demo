import express from 'express';
import { crearReservacion, crearReservacionWalkIn, obtenerReservaciones, obtenerReservacion, actualizarReservacion } from '../controllers/reservations.js';
import { crearReservacionValidators, crearReservacionWalkInValidators, actualizarReservacionValidators } from '../middlewares/validators/reservations.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Rutas de usuario autenticado
router.post('/', [validarJWT, ...crearReservacionValidators], crearReservacion);
router.get('/', validarJWT, obtenerReservaciones);
router.get('/:id', validarJWT, obtenerReservacion);
router.put('/:id', [validarJWT, ...actualizarReservacionValidators], actualizarReservacion);

// Rutas de administrador
router.post('/walk-in', [validarJWT, validarAdmin, ...crearReservacionWalkInValidators], crearReservacionWalkIn);

export default router;