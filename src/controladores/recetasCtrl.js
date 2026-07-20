import { pool } from '../db.js';

export const crearReceta = async (req, res) => {
    try {
        const { cit_id, medicamentos } = req.body;

        const [resultReceta] = await pool.query(
            'INSERT INTO recetas (cit_id) VALUES (?)',
            [cit_id]
        );
        
        const rec_id = resultReceta.insertId; 

        if (medicamentos && medicamentos.length > 0) {
            for (let i = 0; i < medicamentos.length; i++) {
                const med = medicamentos[i];
                await pool.query(
                    'INSERT INTO receta_detalles (rec_id, med_id, cantidad) VALUES (?, ?, ?)',
                    [rec_id, med.med_id, med.cantidad]
                );
            }
        }

        res.status(201).json({ message: 'Receta enviada a farmacia con éxito' });
    } catch (error) {
        console.error('Error SQL al crear la receta:', error);
        res.status(500).json({ message: 'Error al generar la receta' });
    }
};
