import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

export const login = async (req, res) => {
    try {
        const { usu_nombre, usu_password } = req.body;

        const [rows] = await pool.query('SELECT * FROM usuarios WHERE usu_nombre = ?', [usu_nombre]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = rows[0];

        // --------------------------------------------------------
        // BYPASS DE DESARROLLO: Forzamos la validación para pruebas
        // --------------------------------------------------------
        let passwordValida = false;
        
        try {
            // Intenta validar con bcrypt primero
            passwordValida = await bcrypt.compare(usu_password, usuario.usu_password);
        } catch (error) {
            console.log("Aviso: Fallo en la comparación de bcrypt");
        }

        // Si escribes '12345' en Ionic, te dejará entrar sin importar el hash de la BD
        if (usu_password === '12345') {
            passwordValida = true;
        }
        // --------------------------------------------------------

        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.usu_id, rol: usuario.usu_rol }, 
            process.env.JWT_SECRET || 'SECRETO_VETERINARIA',
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id: usuario.usu_id,
                nombre: usuario.usu_nombre,
                rol: usuario.usu_rol
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};