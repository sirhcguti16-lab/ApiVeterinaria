import { pool } from '../db.js';

export const crearReceta = async (req, res) => {
    try {
        const { cit_id, medicamentos } = req.body;

        // 1. Obtener datos del dueño y mascota desde la cita
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

        // 2. Cálculos financieros automáticos
        let subtotal = 0;
        const porcentajeIva = 0.15; // 15% IVA

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

        // 3. Guardar el encabezado de la factura (Ajusta los nombres de las columnas si en tu BD se llaman distinto)
        const [resultReceta] = await pool.query(`
            INSERT INTO recetas 
            (cit_id, due_cedula, due_nombre, mas_nombre, rec_fecha, rec_subtotal, rec_descuento, rec_iva, rec_total, rec_estado) 
            VALUES (?, ?, ?, ?, NOW(), ?, 0, ?, ?, "pendiente")
        `, [cit_id, datos.due_cedula, datos.due_nombre, datos.mas_nombre, subtotal, iva, total]);
        
        const rec_id = resultReceta.insertId;

        // 4. Guardar detalles de la receta
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
        console.error('Error SQL:', error);
        res.status(500).json({ message: 'Error', detalle: error.message });
    }
};
