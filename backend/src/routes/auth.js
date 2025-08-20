import express from 'express';
import { crearUsuario, loginUsuario, revalidarToken } from '../controllers/auth.js';
import { crearUsuarioValidators, loginValidators } from '../middlewares/validators/auth.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', crearUsuarioValidators, crearUsuario);
router.post('/login', loginValidators, loginUsuario);
router.get('/renew', validarJWT, revalidarToken);

export default router;