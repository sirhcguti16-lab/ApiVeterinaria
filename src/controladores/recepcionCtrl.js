import { pool } from '../db.js';

export const getDuenos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, 
                   COUNT(m.mas_id) as cantidad_mascotas,
                   GROUP_CONCAT(m.mas_nombre SEPARATOR ', ') as nombres_mascotas
            FROM duenos d 
            LEFT JOIN mascotas m ON d.due_id = m.due_id
            GROUP BY d.due_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener dueños' });
    }
};

export const registrarDueno = async (req, res) => {
    try {
        const { due_cedula, due_nombre, due_telefono, due_correo } = req.body;
        await pool.query(
            'INSERT INTO duenos (due_cedula, due_nombre, due_telefono, due_correo) VALUES (?, ?, ?, ?)',
            [due_cedula, due_nombre, due_telefono, due_correo]
        );
        res.status(201).json({ message: 'Dueño registrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar dueño' });
    }
};

export const getCitas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, m.mas_nombre, d.due_nombre 
            FROM citas c 
            JOIN mascotas m ON c.mas_id = m.mas_id 
            JOIN duenos d ON m.due_id = d.due_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener citas' });
    }
};
