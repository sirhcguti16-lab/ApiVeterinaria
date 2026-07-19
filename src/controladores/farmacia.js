import { pool } from '../db.js';

export const getMedicamentos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medicamentos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener medicamentos' });
    }
};

export const actualizarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad_agregar } = req.body;
        await pool.query(
            'UPDATE medicamentos SET med_stock = med_stock + ? WHERE med_id = ?',
            [cantidad_agregar, id]
        );
        res.json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar stock' });
    }
};

export const getRecetasPendientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM recetas WHERE rec_estado = "pendiente"');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recetas' });
    }
};