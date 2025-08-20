import express from 'express';
import { obtenerCabanas, obtenerCabana, crearCabana, actualizarCabana, eliminarCabana } from '../controllers/cabins.js';
import { crearCabanaValidators, actualizarCabanaValidators } from '../middlewares/validators/cabins.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerCabanas);
router.get('/:id', obtenerCabana);

// Rutas de administrador
router.post('/', [validarJWT, validarAdmin, ...crearCabanaValidators], crearCabana);
router.put('/:id', [validarJWT, validarAdmin, ...actualizarCabanaValidators], actualizarCabana);
router.delete('/:id', [validarJWT, validarAdmin], eliminarCabana);

export default router;