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
        const { 
            due_cedula, due_nombre, due_telefono, due_correo, 
            mas_nombre, mas_especie, mas_raza, mas_peso 
        } = req.body;

        const [resultDueno] = await pool.query(
            'INSERT INTO duenos (due_cedula, due_nombre, due_telefono, due_correo) VALUES (?, ?, ?, ?)',
            [due_cedula, due_nombre, due_telefono, due_correo]
        );

        const due_id = resultDueno.insertId;

        if (mas_nombre) {
            await pool.query(
                'INSERT INTO mascotas (due_id, mas_nombre, mas_especie, mas_raza, mas_peso) VALUES (?, ?, ?, ?, ?)',
                [due_id, mas_nombre, mas_especie, mas_raza, mas_peso]
            );
        }

        res.status(201).json({ message: 'Dueño y mascota registrados con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar' });
    }
};

export const getCitas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, m.mas_nombre, d.due_nombre 
            FROM citas c 
            JOIN mascotas m ON c.mas_id = m.mas_id 
            JOIN duenos d ON m.due_id = d.due_id
            ORDER BY c.cit_fecha_hora DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener citas' });
    }
};

export const getVeterinarios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT usu_id, usu_nombre FROM usuarios WHERE usu_rol = "veterinario"');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener veterinarios' });
    }
};

export const getMascotas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.mas_id, m.mas_nombre, d.due_nombre 
            FROM mascotas m 
            JOIN duenos d ON m.due_id = d.due_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mascotas' });
    }
};

export const agendarCita = async (req, res) => {
    try {
        const { mas_id, usu_id_vet, cit_fecha_hora, cit_motivo } = req.body;
        await pool.query(
            'INSERT INTO citas (mas_id, usu_id_vet, cit_fecha_hora, cit_motivo, cit_estado) VALUES (?, ?, ?, ?, "pendiente")',
            [mas_id, usu_id_vet, cit_fecha_hora, cit_motivo]
        );
        res.status(201).json({ message: 'Cita agendada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al agendar cita' });
    }
};