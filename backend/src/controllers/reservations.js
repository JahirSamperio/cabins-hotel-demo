import { crearReservacionService, obtenerReservacionesService, obtenerReservacionService, actualizarReservacionService, crearReservacionWalkInService, obtenerReservacionesPorRangoService } from "../services/reservations.js";

export const crearReservacion = async (req, res) => {
    try {
        console.log('Headers:', req.headers)
        console.log('Body:', req.body)
        console.log('User ID:', req.id)
        
        const { cabin_id, check_in, check_out, guests, special_requests, includes_breakfast } = req.body;
        const user_id = req.id;

        const { status, ok, msg, reservation } = await crearReservacionService(user_id, cabin_id, check_in, check_out, guests, special_requests, includes_breakfast);

        res.status(status).json({
            ok,
            msg,
            reservation
        });

    } catch (error) {
        console.error('Error en crearReservacion:', error)
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const crearReservacionWalkIn = async (req, res) => {
    try {
        const { cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status, includes_breakfast } = req.body;
        const created_by_admin = req.id;

        const { status, ok, msg, reservation } = await crearReservacionWalkInService(cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status, created_by_admin, includes_breakfast);

        res.status(status).json({
            ok,
            msg,
            reservation
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerReservaciones = async (req, res) => {
    try {
        const user_id = req.id;
        const is_admin = req.is_admin;
        const { page = 1, limit = 10, status: statusFilter, payment_status, booking_type, date, date_range, search } = req.query;
        
        const filters = {
            status: statusFilter,
            payment_status,
            booking_type,
            date,
            date_range,
            search
        };

        const { status, ok, msg, reservations, pagination } = await obtenerReservacionesService(user_id, is_admin, page, limit, filters);

        res.status(status).json({
            ok,
            msg,
            reservations,
            pagination
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.id;
        const is_admin = req.is_admin;

        const { status, ok, msg, reservation } = await obtenerReservacionService(id, user_id, is_admin);

        res.status(status).json({
            ok,
            msg,
            reservation
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerReservacionesPorRango = async (req, res) => {
    try {
        const user_id = req.id;
        const is_admin = req.is_admin;
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
            return res.status(400).json({
                ok: false,
                msg: "Fechas de inicio y fin son requeridas"
            });
        }

        const { status, ok, msg, reservations } = await obtenerReservacionesPorRangoService(user_id, is_admin, start_date, end_date);

        res.status(status).json({
            ok,
            msg,
            reservations
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const actualizarReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user_id = req.id;
        const is_admin = req.is_admin;

        const { status, ok, msg, reservation } = await actualizarReservacionService(id, updateData, user_id, is_admin);

        res.status(status).json({
            ok,
            msg,
            reservation
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};