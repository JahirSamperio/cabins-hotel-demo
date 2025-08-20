import { obtenerDisponibilidadService, actualizarDisponibilidadService, bloquearFechasService } from "../services/availability.js";

export const obtenerDisponibilidad = async (req, res) => {
    try {
        const { cabin_id } = req.params;
        const { start_date, end_date } = req.query;

        const { status, ok, msg, availability } = await obtenerDisponibilidadService(cabin_id, start_date, end_date);

        res.status(status).json({
            ok,
            msg,
            availability
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const actualizarDisponibilidad = async (req, res) => {
    try {
        const { cabin_id, date, is_available, price_override } = req.body;

        const { status, ok, msg, availability } = await actualizarDisponibilidadService(cabin_id, date, is_available, price_override);

        res.status(status).json({
            ok,
            msg,
            availability
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const bloquearFechas = async (req, res) => {
    try {
        const { cabin_id, start_date, end_date, reason } = req.body;

        const { status, ok, msg, blocked_dates } = await bloquearFechasService(cabin_id, start_date, end_date, reason);

        res.status(status).json({
            ok,
            msg,
            blocked_dates
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};