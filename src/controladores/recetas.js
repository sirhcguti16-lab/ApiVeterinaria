import { pool } from '../db.js';

export const crearReceta = async (req, res) => {
    const { cit_id, subtotal, descuento, iva, total, detalles } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [resultReceta] = await connection.query(
            'INSERT INTO recetas (cit_id, rec_subtotal, rec_descuento, rec_iva, rec_total) VALUES (?, ?, ?, ?, ?)',
            [cit_id, subtotal, descuento, iva, total]
        );
        const rec_id = resultReceta.insertId;

        for (let item of detalles) {
            await connection.query(
                'INSERT INTO receta_detalles (rec_id, med_id, det_dosis, det_cantidad, det_precio_unitario, det_precio_total) VALUES (?, ?, ?, ?, ?, ?)',
                [rec_id, item.med_id, item.dosis, item.cantidad, item.precio_unitario, item.precio_total]
            );
        }

        await connection.commit();

        const io = req.app.get('io');
        if (io) {
            io.emit('alerta-despacho', {
                ped_id: rec_id,
                mensaje: `¡Nueva receta #${rec_id} generada! Lista para ser despachada en bodega.`
            });
        }

        res.status(201).json({ message: "Receta creada con éxito", rec_id });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al procesar la receta" });
    } finally {
        connection.release();
    }
};

export const despacharReceta = async (req, res) => {
    const { id } = req.params; // ID de la receta
    const usu_id = req.usuario.id; // ID del farmacéutico
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('UPDATE recetas SET rec_estado = "entregada" WHERE rec_id = ?', [id]);

        const [detalles] = await connection.query('SELECT med_id, det_cantidad FROM receta_detalles WHERE rec_id = ?', [id]);

        for (let item of detalles) {
            await connection.query(
                'UPDATE medicamentos SET med_stock = med_stock - ? WHERE med_id = ?',
                [item.det_cantidad, item.med_id]
            );
            
            await connection.query(
                'INSERT INTO historial_inventario (med_id, usu_id, hist_tipo_movimiento, hist_cantidad, hist_motivo) VALUES (?, ?, "salida", ?, ?)',
                [item.med_id, usu_id, item.det_cantidad, `Despacho de receta #${id}`]
            );
        }

        await connection.commit();
        res.json({ message: "Receta despachada, productos entregados y stock actualizado." });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al intentar despachar la receta." });
    } finally {
        connection.release();
    }
};