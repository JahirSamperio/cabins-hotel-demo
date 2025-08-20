import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const crearReservacionValidators = [
    check('cabin_id', 'El ID de la cabaña es obligatorio').isUUID(),
    check('check_in', 'La fecha de entrada es obligatoria').isDate(),
    check('check_out', 'La fecha de salida es obligatoria').isDate(),
    check('guests', 'El número de huéspedes debe ser mayor a 0').isInt({ min: 1 }),
    validarCampos
];

export const crearReservacionWalkInValidators = [
    check('cabin_id', 'El ID de la cabaña es obligatorio').isUUID(),
    check('check_in', 'La fecha de entrada es obligatoria').isDate(),
    check('check_out', 'La fecha de salida es obligatoria').isDate(),
    check('guests', 'El número de huéspedes debe ser mayor a 0').isInt({ min: 1 }),
    check('guest_name', 'El nombre del huésped es obligatorio').not().isEmpty(),
    check('guest_phone', 'El teléfono del huésped es obligatorio').not().isEmpty(),
    check('payment_method', 'El método de pago es obligatorio').isIn(['cash', 'card', 'transfer']),
    validarCampos
];

export const actualizarReservacionValidators = [
    check('status', 'El estado debe ser válido').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
    check('payment_status', 'El estado de pago debe ser válido').optional().isIn(['pending', 'paid', 'partial']),
    validarCampos
];