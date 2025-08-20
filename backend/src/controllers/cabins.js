import { obtenerCabanasService, obtenerCabanaService, crearCabanaService, actualizarCabanaService, eliminarCabanaService } from "../services/cabins.js";

export const obtenerCabanas = async (req, res) => {
    try {
        const { status, ok, msg, cabins } = await obtenerCabanasService();

        res.status(status).json({
            ok,
            msg,
            cabins
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerCabana = async (req, res) => {
    try {
        const { id } = req.params;

        const { status, ok, msg, cabin } = await obtenerCabanaService(id);

        res.status(status).json({
            ok,
            msg,
            cabin
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const crearCabana = async (req, res) => {
    try {
        const { name, capacity, price_per_night, description, amenities, images } = req.body;

        const { status, ok, msg, cabin } = await crearCabanaService(name, capacity, price_per_night, description, amenities, images);

        res.status(status).json({
            ok,
            msg,
            cabin
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const actualizarCabana = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const { status, ok, msg, cabin } = await actualizarCabanaService(id, updateData);

        res.status(status).json({
            ok,
            msg,
            cabin
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const eliminarCabana = async (req, res) => {
    try {
        const { id } = req.params;

        const { status, ok, msg } = await eliminarCabanaService(id);

        res.status(status).json({
            ok,
            msg
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};