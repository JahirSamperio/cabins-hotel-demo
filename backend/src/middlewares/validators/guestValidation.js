import validator from 'validator';

export const validateGuestReservation = (req, res, next) => {
    const { cabin_id, check_in, check_out, guests, guest_name, guest_email, guest_phone, honeypot } = req.body;
    const errors = [];

    // Honeypot field - detectar bots
    if (honeypot && honeypot.trim() !== '') {
        return res.status(400).json({
            ok: false,
            msg: 'Solicitud inválida',
            code: 'BOT_DETECTED'
        });
    }

    // Validar campos requeridos
    if (!cabin_id) errors.push('ID de cabaña es requerido');
    if (!check_in) errors.push('Fecha de check-in es requerida');
    if (!check_out) errors.push('Fecha de check-out es requerida');
    if (!guests || guests < 1) errors.push('Número de huéspedes inválido');
    if (!guest_name || guest_name.trim().length < 2) errors.push('Nombre del huésped es requerido');
    if (!guest_email) errors.push('Email es requerido');
    if (!guest_phone) errors.push('Teléfono es requerido');

    // Validar email
    if (guest_email && !validator.isEmail(guest_email)) {
        errors.push('Email inválido');
    }

    // Validar email no sea temporal/desechable
    const disposableEmailDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
        'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ];
    if (guest_email) {
        const emailDomain = guest_email.split('@')[1]?.toLowerCase();
        if (disposableEmailDomains.includes(emailDomain)) {
            errors.push('No se permiten emails temporales');
        }
    }

    // Validar nombre (solo letras, espacios y acentos)
    if (guest_name && !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,50}$/.test(guest_name.trim())) {
        errors.push('Nombre inválido (solo letras y espacios)');
    }

    // Validar teléfono mexicano
    if (guest_phone) {
        const cleanPhone = guest_phone.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^(\+52|52)?[1-9]\d{9}$/;
        if (!phoneRegex.test(cleanPhone)) {
            errors.push('Teléfono inválido (formato mexicano requerido)');
        }
    }

    // Validar fechas
    if (check_in && check_out) {
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            errors.push('La fecha de check-in no puede ser pasada');
        }

        if (checkOutDate <= checkInDate) {
            errors.push('La fecha de check-out debe ser posterior al check-in');
        }

        const diffTime = checkOutDate - checkInDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays > 30) {
            errors.push('La estadía no puede ser mayor a 30 días');
        }

        if (diffDays < 1) {
            errors.push('La estadía mínima es de 1 noche');
        }
    }

    // Validar número de huéspedes
    if (guests && (guests < 1 || guests > 12)) {
        errors.push('Número de huéspedes debe estar entre 1 y 12');
    }

    // Validar UUID de cabaña
    if (cabin_id && !validator.isUUID(cabin_id)) {
        errors.push('ID de cabaña inválido');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            ok: false,
            msg: 'Errores de validación',
            errors,
            code: 'VALIDATION_ERROR'
        });
    }

    next();
};

export const detectSuspiciousActivity = async (req, res, next) => {
    const { guest_email, guest_phone } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    try {
        // Importar dinámicamente para evitar dependencias circulares
        const { default: Reservation } = await import('../../models/Reservation.js');
        const { Op } = await import('sequelize');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Verificar reservas duplicadas por email en las últimas 24 horas
        const recentReservationsByEmail = await Reservation.count({
            where: {
                guest_email: guest_email,
                created_at: {
                    [Op.gte]: today
                }
            }
        });

        if (recentReservationsByEmail >= 2) {
            return res.status(429).json({
                ok: false,
                msg: 'Ya tienes reservas recientes. Contacta al hotel para más reservas.',
                code: 'DUPLICATE_EMAIL'
            });
        }

        // Verificar reservas por teléfono
        const recentReservationsByPhone = await Reservation.count({
            where: {
                guest_phone: guest_phone,
                created_at: {
                    [Op.gte]: today
                }
            }
        });

        if (recentReservationsByPhone >= 2) {
            return res.status(429).json({
                ok: false,
                msg: 'Ya tienes reservas recientes con este teléfono.',
                code: 'DUPLICATE_PHONE'
            });
        }

        next();
    } catch (error) {
        console.error('Error en detectSuspiciousActivity:', error);
        next(); // Continuar si hay error en la validación
    }
};