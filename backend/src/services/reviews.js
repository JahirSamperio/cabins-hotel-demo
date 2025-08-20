import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";
import Cabin from "../models/Cabin.js";
import User from "../models/User.js";

export const crearReviewService = async (user_id, reservation_id, rating, title, content, name) => {
    try {
        // Verificar que la reservación existe y pertenece al usuario
        const reservation = await Reservation.findOne({
            where: {
                id: reservation_id,
                user_id,
                status: 'completed'
            }
        });

        if (!reservation) {
            return {
                ok: false,
                status: 404,
                msg: "Reservación no encontrada o no completada"
            };
        }

        // Verificar que no haya review previo para esta reservación
        const existingReview = await Review.findOne({
            where: { reservation_id }
        });

        if (existingReview) {
            return {
                ok: false,
                status: 409,
                msg: "Ya existe un review para esta reservación"
            };
        }

        const review = await Review.create({
            user_id,
            reservation_id,
            cabin_id: reservation.cabin_id,
            name,
            rating,
            title,
            content,
            status: 'pending'
        });

        return {
            ok: true,
            status: 201,
            msg: "Review creado exitosamente",
            review
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

export const obtenerReviewsService = async (cabin_id, status_filter) => {
    try {
        const whereClause = {};
        
        if (cabin_id) {
            whereClause.cabin_id = cabin_id;
        }
        
        if (status_filter) {
            whereClause.status = status_filter;
        } else {
            whereClause.status = 'approved'; // Por defecto solo aprobados
        }

        const reviews = await Review.findAll({
            where: whereClause,
            include: [
                {
                    model: Cabin,
                    attributes: ['name']
                }
            ],
            order: [
                ['is_featured', 'DESC'],
                ['display_order', 'ASC'],
                ['created_at', 'DESC']
            ]
        });

        return {
            ok: true,
            status: 200,
            msg: "Reviews obtenidos exitosamente",
            reviews
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

export const aprobarReviewService = async (id, status_review, is_featured) => {
    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return {
                ok: false,
                status: 404,
                msg: "Review no encontrado"
            };
        }

        await review.update({
            status: status_review,
            is_featured: is_featured || false
        });

        return {
            ok: true,
            status: 200,
            msg: "Review actualizado exitosamente",
            review
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

export const crearTestimonioService = async (name, location, rating, title, content, display_order) => {
    try {
        const testimonial = await Review.create({
            user_id: null,
            reservation_id: null,
            cabin_id: null,
            name,
            location,
            rating,
            title,
            content,
            status: 'approved',
            is_featured: true,
            display_order
        });

        return {
            ok: true,
            status: 201,
            msg: "Testimonio creado exitosamente",
            testimonial
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

export const obtenerTestimoniosService = async (featured_only) => {
    try {
        const whereClause = {
            status: 'approved'
        };

        if (featured_only === 'true') {
            whereClause.is_featured = true;
        }

        const testimonials = await Review.findAll({
            where: whereClause,
            order: [
                ['is_featured', 'DESC'],
                ['display_order', 'ASC'],
                ['created_at', 'DESC']
            ]
        });

        return {
            ok: true,
            status: 200,
            msg: "Testimonios obtenidos exitosamente",
            testimonials
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