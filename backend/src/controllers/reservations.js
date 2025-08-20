import { crearReservacionService, obtenerReservacionesService, obtenerReservacionService, actualizarReservacionService, crearReservacionWalkInService } from "../services/reservations.js";

export const crearReservacion = async (req, res) => {
    try {
        const { cabin_id, check_in, check_out, guests, special_requests } = req.body;
        const user_id = req.id;

        const { status, ok, msg, reservation } = await crearReservacionService(user_id, cabin_id, check_in, check_out, guests, special_requests);

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

export const crearReservacionWalkIn = async (req, res) => {
    try {
        const { cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status } = req.body;
        const created_by_admin = req.id;

        const { status, ok, msg, reservation } = await crearReservacionWalkInService(cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status, created_by_admin);

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

        const { status, ok, msg, reservations } = await obtenerReservacionesService(user_id, is_admin);

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