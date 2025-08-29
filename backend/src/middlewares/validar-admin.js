export const validarAdmin = (req, res, next) => {
    if (!req.is_admin) {
        return res.status(403).json({
            ok: false,
            msg: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};