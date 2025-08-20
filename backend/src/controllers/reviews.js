import { crearReviewService, obtenerReviewsService, aprobarReviewService, crearTestimonioService, obtenerTestimoniosService } from "../services/reviews.js";

export const crearReview = async (req, res) => {
    try {
        const { reservation_id, rating, title, content } = req.body;
        const user_id = req.id;
        const name = req.name;

        const { status, ok, msg, review } = await crearReviewService(user_id, reservation_id, rating, title, content, name);

        res.status(status).json({
            ok,
            msg,
            review
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerReviews = async (req, res) => {
    try {
        const { cabin_id, status_filter } = req.query;

        const { status, ok, msg, reviews } = await obtenerReviewsService(cabin_id, status_filter);

        res.status(status).json({
            ok,
            msg,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const aprobarReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_review, is_featured } = req.body;

        const { status, ok, msg, review } = await aprobarReviewService(id, status_review, is_featured);

        res.status(status).json({
            ok,
            msg,
            review
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const crearTestimonio = async (req, res) => {
    try {
        const { name, location, rating, title, content, display_order } = req.body;

        const { status, ok, msg, testimonial } = await crearTestimonioService(name, location, rating, title, content, display_order);

        res.status(status).json({
            ok,
            msg,
            testimonial
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const obtenerTestimonios = async (req, res) => {
    try {
        const { featured_only } = req.query;

        const { status, ok, msg, testimonials } = await obtenerTestimoniosService(featured_only);

        res.status(status).json({
            ok,
            msg,
            testimonials
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};