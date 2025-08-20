import Cabin from "../models/Cabin.js";

export const obtenerCabanasService = async () => {
    try {
        const cabins = await Cabin.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']]
        });

        return {
            ok: true,
            status: 200,
            msg: "Cabañas obtenidas exitosamente",
            cabins
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

export const obtenerCabanaService = async (id) => {
    try {
        const cabin = await Cabin.findByPk(id);

        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        return {
            ok: true,
            status: 200,
            msg: "Cabaña obtenida exitosamente",
            cabin
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

export const crearCabanaService = async (name, capacity, price_per_night, description, amenities, images) => {
    try {
        const cabin = await Cabin.create({
            name,
            capacity,
            price_per_night,
            description,
            amenities,
            images,
            is_active: true
        });

        return {
            ok: true,
            status: 201,
            msg: "Cabaña creada exitosamente",
            cabin
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

export const actualizarCabanaService = async (id, updateData) => {
    try {
        const cabin = await Cabin.findByPk(id);

        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        await cabin.update(updateData);

        return {
            ok: true,
            status: 200,
            msg: "Cabaña actualizada exitosamente",
            cabin
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

export const eliminarCabanaService = async (id) => {
    try {
        const cabin = await Cabin.findByPk(id);

        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        // Soft delete
        await cabin.update({ is_active: false });

        return {
            ok: true,
            status: 200,
            msg: "Cabaña eliminada exitosamente"
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