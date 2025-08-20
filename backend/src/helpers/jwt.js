import jwt from 'jsonwebtoken';

export const generarJWT = (id, name, email, is_admin) => {
    return new Promise((resolve, reject) => {
        if (!process.env.JWT_SECRET) {
            reject('JWT_SECRET no está configurado');
            return;
        }

        const payload = { id, name, email, is_admin };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        });
    });
};