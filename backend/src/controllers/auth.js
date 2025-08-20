import { generarJWT } from "../helpers/jwt.js";
import { crearUsuarioService, loginService } from "../services/auth.js";

export const crearUsuario = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const { status, ok, msg, user } = await crearUsuarioService(name, email, password, phone);

        res.status(status).json({
            ok,
            msg,
            uid: user?.id,
            name: user?.name,
            email: user?.email
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { ok, status, msg, token, user } = await loginService(email, password);

        res.status(status).json({
            ok,
            msg,
            token,
            user: user ? {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
            } : null
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

export const revalidarToken = async (req, res) => {
    try {
        const id = req.id;
        const name = req.name;
        const email = req.email;
        const is_admin = req.is_admin;

        // Generar un nuevo JWT y retornarlo en esta peticion
        const token = await generarJWT(id, name, email, is_admin);

        res.json({
            ok: true,
            user: { id, name, email, is_admin },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};