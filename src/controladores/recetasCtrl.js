import { pool } from '../db.js';

export const crearReceta = async (req, res) => {
    try {
        const { cit_id, medicamentos } = req.body;

        const [infoCita] = await pool.query(`
            SELECT d.due_cedula, d.due_nombre, d.due_telefono, m.mas_nombre 
            FROM citas c
            JOIN mascotas m ON c.mas_id = m.mas_id
            JOIN duenos d ON m.due_id = d.due_id
            WHERE c.cit_id = ?
        `, [cit_id]);

        if (infoCita.length === 0) {
            return res.status(404).json({ message: 'Datos de la cita no encontrados' });
        }
        const datos = infoCita[0];

        let subtotal = 0;
        const porcentajeIva = 0.15; 

        if (medicamentos && medicamentos.length > 0) {
            for (let i = 0; i < medicamentos.length; i++) {
                const med = medicamentos[i];
                const [rows] = await pool.query('SELECT med_precio FROM medicamentos WHERE med_id = ?', [med.med_id]);
                if (rows.length > 0) {
                    subtotal += rows[0].med_precio * med.cantidad;
                }
            }
        }

        const iva = subtotal * porcentajeIva;
        const total = subtotal + iva;

        const [resultReceta] = await pool.query(`
            INSERT INTO recetas 
            (cit_id, due_cedula, due_nombre, mas_nombre, rec_fecha, rec_subtotal, rec_descuento, rec_iva, rec_total, rec_estado) 
            VALUES (?, ?, ?, ?, NOW(), ?, 0, ?, ?, "pendiente")
        `, [cit_id, datos.due_cedula, datos.due_nombre, datos.mas_nombre, subtotal, iva, total]);
        
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

        res.status(201).json({ message: 'Factura generada con éxito' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error', detalle: error.message });
    }
};

export const getRecetasPendientes = async (req, res) => {
    try {
        const [recetas] = await pool.query('SELECT * FROM recetas WHERE rec_estado = "pendiente" ORDER BY rec_fecha DESC');
        
        for (let rec of recetas) {
            const [detalles] = await pool.query(`
                SELECT rd.*, m.med_nombre, (rd.cantidad * m.med_precio) as total_linea
                FROM receta_detalles rd 
                JOIN medicamentos m ON rd.med_id = m.med_id 
                WHERE rd.rec_id = ?
            `, [rec.rec_id]);
            rec.detalles = detalles;
        }
        
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error', detalle: error.message });
    }
};

export const getRecetasDespachadas = async (req, res) => {
    try {
        const [recetas] = await pool.query('SELECT * FROM recetas WHERE rec_estado = "despachada" ORDER BY rec_fecha DESC');
        
        for (let rec of recetas) {
            const [detalles] = await pool.query(`
                SELECT rd.*, m.med_nombre, (rd.cantidad * m.med_precio) as total_linea
                FROM receta_detalles rd 
                JOIN medicamentos m ON rd.med_id = m.med_id 
                WHERE rd.rec_id = ?
            `, [rec.rec_id]);
            rec.detalles = detalles;
        }
        
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error', detalle: error.message });
    }
};

export const despacharReceta = async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('UPDATE recetas SET rec_estado = "despachada" WHERE rec_id = ?', [id]);
        
        const [detalles] = await pool.query('SELECT med_id, cantidad FROM receta_detalles WHERE rec_id = ?', [id]);
        for (let det of detalles) {
            await pool.query('UPDATE medicamentos SET med_stock = med_stock - ? WHERE med_id = ?', [det.cantidad, det.med_id]);
        }

        res.json({ message: 'Receta despachada y stock actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error', detalle: error.message });
    }
};
