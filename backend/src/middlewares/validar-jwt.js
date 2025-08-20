import jwt from 'jsonwebtoken';

export const validarJWT = (req, res, next) => {
    // Leer el Token
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            ok: false,
            msg: 'JWT_SECRET no configurado'
        });
    }

    try {
        const { id, name, email, is_admin } = jwt.verify(token, process.env.JWT_SECRET);

        req.id = id;
        req.name = name;
        req.email = email;
        req.is_admin = is_admin;

        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
};

export const validarAdmin = (req, res, next) => {
    if (!req.is_admin) {
        return res.status(403).json({
            ok: false,
            msg: 'No tienes permisos de administrador'
        });
    }
    next();
};