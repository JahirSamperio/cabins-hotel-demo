import Availability from '../models/Availability.js';
import Cabin from '../models/Cabin.js';
import { Op } from 'sequelize';

// Obtener disponibilidad por rango de fechas
export const getAvailabilityByRange = async (req, res) => {
    try {
        const { start_date, end_date, cabin_id, page = 1, limit = 100 } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                ok: false,
                msg: 'Se requieren las fechas de inicio y fin'
            });
        }

        const whereClause = {
            date: {
                [Op.between]: [start_date, end_date]
            }
        };

        if (cabin_id) {
            whereClause.cabin_id = cabin_id;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: availability } = await Availability.findAndCountAll({
            where: whereClause,
            include: [{
                model: Cabin,
                attributes: ['id', 'name']
            }],
            order: [['date', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            ok: true,
            availability,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting availability:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};

// Crear o actualizar disponibilidad
export const setAvailability = async (req, res) => {
    try {
        const { cabin_id, date, is_available, price_override } = req.body;

        if (!cabin_id || !date) {
            return res.status(400).json({
                ok: false,
                msg: 'Se requiere cabin_id y date'
            });
        }

        // Verificar que la cabaña existe
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return res.status(404).json({
                ok: false,
                msg: 'Cabaña no encontrada'
            });
        }

        const [availability, created] = await Availability.upsert({
            cabin_id,
            date,
            is_available: is_available !== undefined ? is_available : true,
            price_override: price_override || null
        });

        res.status(created ? 201 : 200).json({
            ok: true,
            msg: created ? 'Disponibilidad creada' : 'Disponibilidad actualizada',
            availability
        });

    } catch (error) {
        console.error('Error setting availability:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};

// Establecer disponibilidad para múltiples fechas
export const setBulkAvailability = async (req, res) => {
    try {
        const { cabin_id, start_date, end_date, is_available, price_override, reason } = req.body;

        if (!cabin_id || !start_date || !end_date) {
            return res.status(400).json({
                ok: false,
                msg: 'Se requiere cabin_id, start_date y end_date'
            });
        }

        // Verificar que la cabaña existe
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return res.status(404).json({
                ok: false,
                msg: 'Cabaña no encontrada'
            });
        }

        // Generar array de fechas
        const dates = [];
        const currentDate = new Date(start_date);
        const endDate = new Date(end_date);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate).toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Crear/actualizar disponibilidad para cada fecha
        const availabilityRecords = [];
        for (const date of dates) {
            const [availability] = await Availability.upsert({
                cabin_id,
                date,
                is_available: is_available !== undefined ? is_available : true,
                price_override: price_override || null
            });
            availabilityRecords.push(availability);
        }

        res.status(200).json({
            ok: true,
            msg: `Disponibilidad ${is_available ? 'habilitada' : 'bloqueada'} para ${dates.length} fecha(s)`,
            count: dates.length,
            reason: reason || null
        });

    } catch (error) {
        console.error('Error setting bulk availability:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};

// Eliminar registro de disponibilidad
export const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const availability = await Availability.findByPk(id);
        if (!availability) {
            return res.status(404).json({
                ok: false,
                msg: 'Registro de disponibilidad no encontrado'
            });
        }

        await availability.destroy();

        res.status(200).json({
            ok: true,
            msg: 'Registro de disponibilidad eliminado'
        });

    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};