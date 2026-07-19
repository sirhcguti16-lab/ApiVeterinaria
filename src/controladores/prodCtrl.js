import { pool } from '../db.js';

export const getProductos = async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM medicamentos');
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener inventario" });
    }
};

export const agregarStock = async (req, res) => {
    const { med_id, cantidad, motivo } = req.body;
    const usu_id = req.usuario.id; 
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE medicamentos SET med_stock = med_stock + ? WHERE med_id = ?',
            [cantidad, med_id]
        );

        await connection.query(
            'INSERT INTO historial_inventario (med_id, usu_id, hist_tipo_movimiento, hist_cantidad, hist_motivo) VALUES (?, ?, "entrada", ?, ?)',
            [med_id, usu_id, cantidad, motivo]
        );

        await connection.commit(); 
        res.json({ message: "Stock actualizado y registrado en Kardex correctamente" });

    } catch (error) {
        await connection.rollback(); 
        console.error(error);
        res.status(500).json({ message: "Error al actualizar stock" });
    } finally {
        connection.release();
    }
};