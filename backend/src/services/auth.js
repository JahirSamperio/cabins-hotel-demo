import { generarJWT } from "../helpers/jwt.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';

export const crearUsuarioService = async (name, email, password, phone) => {
    try {
        // Verificar que no haya duplicados
        const existeUsuario = await User.findOne({ where: { email } });
        if (existeUsuario) {
            return {
                ok: false,
                status: 409,
                msg: "Este email ya está registrado"
            };
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            is_admin: false,
            is_guest: false
        });

        return {
            ok: true,
            status: 201,
            msg: "Usuario creado exitosamente",
            user
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

export const loginService = async (email, password) => {
    try {
        // Verificar que el usuario exista
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return {
                ok: false,
                status: 404,
                msg: 'Este usuario no existe',
                token: null
            };
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return {
                ok: false,
                status: 401,
                msg: "La contraseña es incorrecta",
                token: null
            };
        }

        // Generar JWT
        const token = await generarJWT(user.id, user.name, user.email, user.is_admin);

        return {
            ok: true,
            status: 200,
            msg: 'Usuario autenticado exitosamente',
            token,
            user
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