import Reservation from "../models/Reservation.js";
import Cabin from "../models/Cabin.js";
import User from "../models/User.js";

export const crearReservacionService = async (user_id, cabin_id, check_in, check_out, guests, special_requests) => {
    try {
        // Verificar que la cabaña existe
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        // Calcular precio total
        const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
        const total_price = nights * cabin.price_per_night;

        const reservation = await Reservation.create({
            user_id,
            cabin_id,
            check_in,
            check_out,
            guests,
            total_price,
            special_requests,
            status: 'pending',
            booking_type: 'online',
            payment_method: 'online',
            payment_status: 'pending'
        });

        return {
            ok: true,
            status: 201,
            msg: "Reservación creada exitosamente",
            reservation
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const crearReservacionWalkInService = async (cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status, created_by_admin) => {
    try {
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
        const total_price = nights * cabin.price_per_night;

        const reservation = await Reservation.create({
            user_id: 'guest-user-uuid', // Usuario invitado
            cabin_id,
            check_in,
            check_out,
            guests,
            total_price,
            status: 'confirmed',
            booking_type: 'walk_in',
            created_by_admin,
            guest_name,
            guest_phone,
            payment_method,
            payment_status
        });

        return {
            ok: true,
            status: 201,
            msg: "Reservación walk-in creada exitosamente",
            reservation
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const obtenerReservacionesService = async (user_id, is_admin) => {
    try {
        let whereClause = {};
        
        if (!is_admin) {
            whereClause.user_id = user_id;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Cabin,
                    attributes: ['name', 'capacity']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return {
            ok: true,
            status: 200,
            msg: "Reservaciones obtenidas exitosamente",
            reservations
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const obtenerReservacionService = async (id, user_id, is_admin) => {
    try {
        let whereClause = { id };
        
        if (!is_admin) {
            whereClause.user_id = user_id;
        }

        const reservation = await Reservation.findOne({
            where: whereClause,
            include: [
                {
                    model: Cabin,
                    attributes: ['name', 'capacity', 'description']
                }
            ]
        });

        if (!reservation) {
            return {
                ok: false,
                status: 404,
                msg: "Reservación no encontrada"
            };
        }

        return {
            ok: true,
            status: 200,
            msg: "Reservación obtenida exitosamente",
            reservation
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const actualizarReservacionService = async (id, updateData, user_id, is_admin) => {
    try {
        let whereClause = { id };
        
        if (!is_admin) {
            whereClause.user_id = user_id;
            // Los usuarios solo pueden cancelar
            updateData = { status: 'cancelled' };
        }

        const reservation = await Reservation.findOne({ where: whereClause });

        if (!reservation) {
            return {
                ok: false,
                status: 404,
                msg: "Reservación no encontrada"
            };
        }

        await reservation.update(updateData);

        return {
            ok: true,
            status: 200,
            msg: "Reservación actualizada exitosamente",
            reservation
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};