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

        // 1. Buscamos si la cédula ya existe en la base
        const [existingDuenos] = await pool.query('SELECT due_id FROM duenos WHERE due_cedula = ?', [due_cedula]);
        let due_id;

        if (existingDuenos.length > 0) {
            // Si el dueño existe, capturamos su ID y actualizamos sus datos por si cambió de teléfono o correo
            due_id = existingDuenos[0].due_id;
            await pool.query(
                'UPDATE duenos SET due_nombre = ?, due_telefono = ?, due_correo = ? WHERE due_id = ?',
                [due_nombre, due_telefono, due_correo, due_id]
            );
        } else {
            // Si no existe, creamos un dueño completamente nuevo
            const [resultDueno] = await pool.query(
                'INSERT INTO duenos (due_cedula, due_nombre, due_telefono, due_correo) VALUES (?, ?, ?, ?)',
                [due_cedula, due_nombre, due_telefono, due_correo]
            );
            due_id = resultDueno.insertId;
        }

        // 2. Insertar la mascota SOLO si el usuario escribió un nombre de mascota en el formulario
        if (mas_nombre && mas_nombre.trim() !== '') {
            await pool.query(
                'INSERT INTO mascotas (due_id, mas_nombre, mas_especie, mas_raza, mas_peso) VALUES (?, ?, ?, ?, ?)',
                [due_id, mas_nombre, mas_especie, mas_raza, mas_peso]
            );
        }

        res.status(201).json({ message: 'Proceso completado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar o actualizar' });
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

export const editarDueno = async (req, res) => {
    try {
        const { id } = req.params;
        const { due_nombre, due_telefono, due_correo } = req.body;
        await pool.query(
            'UPDATE duenos SET due_nombre = ?, due_telefono = ?, due_correo = ? WHERE due_id = ?',
            [due_nombre, due_telefono, due_correo, id]
        );
        res.json({ message: 'Dueño actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar dueño' });
    }
};

export const editarMascota = async (req, res) => {
    try {
        const { id } = req.params;
        const { mas_nombre, mas_especie, mas_raza, mas_peso } = req.body;
        await pool.query(
            'UPDATE mascotas SET mas_nombre = ?, mas_especie = ?, mas_raza = ?, mas_peso = ? WHERE mas_id = ?',
            [mas_nombre, mas_especie, mas_raza, mas_peso, id]
        );
        res.json({ message: 'Mascota actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar mascota' });
    }
};
