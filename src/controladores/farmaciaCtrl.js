import { pool } from '../db.js';

export const getMedicamentos = async (req, res) => {
    try {
        const [medicamentos] = await pool.query('SELECT * FROM medicamentos');
        res.json(medicamentos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener inventario', detalle: error.message });
    }
};

export const actualizarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad_agregar } = req.body;
        await pool.query('UPDATE medicamentos SET med_stock = med_stock + ? WHERE med_id = ?', [cantidad_agregar, id]);
        res.json({ message: 'Stock actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar stock' });
    }
};

export const editarMedicamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { med_nombre, med_descripcion, med_precio } = req.body;
        await pool.query(
            'UPDATE medicamentos SET med_nombre = ?, med_descripcion = ?, med_precio = ? WHERE med_id = ?',
            [med_nombre, med_descripcion, med_precio, id]
        );
        res.json({ message: 'Medicamento editado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar medicamento' });
    }
};

export const getRecetasPendientes = async (req, res) => {
    try {
        const [recetas] = await pool.query(`
            SELECT r.rec_id, c.cit_fecha_hora, m.mas_nombre, d.due_nombre
            FROM recetas r
            JOIN citas c ON r.cit_id = c.cit_id
            JOIN mascotas m ON c.mas_id = m.mas_id
            JOIN duenos d ON m.due_id = d.due_id
            WHERE r.rec_estado = 'pendiente'
        `);
        
        for (let receta of recetas) {
            const [detalles] = await pool.query(`
                SELECT rd.cantidad, med.med_nombre, med.med_id, med.med_stock
                FROM receta_detalles rd
                JOIN medicamentos med ON rd.med_id = med.med_id
                WHERE rd.rec_id = ?
            `, [receta.rec_id]);
            receta.detalles = detalles;
        }
        
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recetas' });
    }
};

export const getRecetasDespachadas = async (req, res) => {
    try {
        const [recetas] = await pool.query(`
            SELECT r.*, c.cit_fecha_hora, m.mas_nombre, d.due_nombre, d.due_cedula
            FROM recetas r
            JOIN citas c ON r.cit_id = c.cit_id
            JOIN mascotas m ON c.mas_id = m.mas_id
            JOIN duenos d ON m.due_id = d.due_id
            WHERE r.rec_estado = 'despachada'
            ORDER BY r.rec_fecha DESC
        `);
        
        for (let receta of recetas) {
            const [detalles] = await pool.query(`
                SELECT rd.cantidad, med.med_nombre, med.med_id, (rd.cantidad * med.med_precio) as total_linea
                FROM receta_detalles rd
                JOIN medicamentos med ON rd.med_id = med.med_id
                WHERE rd.rec_id = ?
            `, [receta.rec_id]);
            receta.detalles = detalles;
        }
        
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};

export const despacharReceta = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        const [detalles] = await connection.query('SELECT med_id, cantidad FROM receta_detalles WHERE rec_id = ?', [id]);

        for (let det of detalles) {
            await connection.query('UPDATE medicamentos SET med_stock = med_stock - ? WHERE med_id = ?', [det.cantidad, det.med_id]);
        }

        await connection.query('UPDATE recetas SET rec_estado = "despachada" WHERE rec_id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Receta despachada' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error al despachar receta' });
    } finally {
        connection.release();
    }
};
