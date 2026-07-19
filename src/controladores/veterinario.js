import { pool } from '../db.js';

export const getCitasPendientes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, m.mas_nombre, m.mas_especie 
            FROM citas c 
            JOIN mascotas m ON c.mas_id = m.mas_id 
            WHERE c.cit_estado = 'pendiente'
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
            'UPDATE citas SET cit_diagnostico = ?, cit_estado = "atendida" WHERE cit_id = ?',
            [cit_diagnostico, id]
        );
        res.json({ message: 'Cita actualizada a atendida' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cita' });
    }
};