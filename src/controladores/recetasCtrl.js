import { pool } from '../db.js';

export const crearReceta = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { cit_id, medicamentos } = req.body;
        
        await connection.beginTransaction();

        const [resultReceta] = await connection.query(
            'INSERT INTO recetas (cit_id, rec_estado) VALUES (?, "pendiente")',
            [cit_id]
        );
        
        const rec_id = resultReceta.insertId;

        for (const med of medicamentos) {
            await connection.query(
                'INSERT INTO recetas_detalle (rec_id, med_id, cantidad) VALUES (?, ?, ?)',
                [rec_id, med.med_id, med.cantidad]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Receta generada con éxito' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error al generar la receta' });
    } finally {
        connection.release();
    }
};
