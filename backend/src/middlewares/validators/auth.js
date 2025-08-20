import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const crearUsuarioValidators = [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser válido').isEmail(),
    check('password', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 }),
    check('phone', 'El teléfono es obligatorio').not().isEmpty(),
    validarCampos
];

export const loginValidators = [
    check('email', 'El email debe ser válido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
];