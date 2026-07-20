import { pool } from '../db.js';

export const getCitasPendientes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, m.mas_nombre, m.mas_especie, d.due_nombre 
            FROM citas c 
            JOIN mascotas m ON c.mas_id = m.mas_id 
            JOIN duenos d ON m.due_id = d.due_id
            WHERE c.cit_estado = 'pendiente'
            ORDER BY c.cit_fecha_hora ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener citas pendientes' });
    }
};

export const atenderCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { cit_diagnostico } = req.body;
        await pool.query(
            'UPDATE citas SET cit_estado = "atendida", cit_diagnostico = ? WHERE cit_id = ?',
            [cit_diagnostico, id]
        );
        res.json({ message: 'Cita atendida correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al atender cita' });
    }
};
