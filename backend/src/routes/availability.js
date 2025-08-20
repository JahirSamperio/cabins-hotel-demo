import express from 'express';
import { obtenerDisponibilidad, actualizarDisponibilidad, bloquearFechas } from '../controllers/availability.js';
import { actualizarDisponibilidadValidators, bloquearFechasValidators } from '../middlewares/validators/availability.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Rutas públicas
router.get('/:cabin_id', obtenerDisponibilidad);

// Rutas de administrador
router.post('/', [validarJWT, validarAdmin, ...actualizarDisponibilidadValidators], actualizarDisponibilidad);
router.post('/block', [validarJWT, validarAdmin, ...bloquearFechasValidators], bloquearFechas);

export default router;