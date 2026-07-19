import { pool } from '../db.js';

export const getClientes = async (req, res) => {
    try {
        const [duenos] = await pool.query('SELECT * FROM duenos');
        const [mascotas] = await pool.query('SELECT * FROM mascotas');

        const clientesCompletos = duenos.map(dueno => {
            return {
                ...dueno,
                mascotas: mascotas.filter(m => m.due_id === dueno.due_id)
            };
        });
        
        res.json(clientesCompletos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};

export const createDueno = async (req, res) => {
    try {
        const { due_cedula, due_nombre, due_telefono, due_correo } = req.body;
        const [result] = await pool.query(
            'INSERT INTO duenos (due_cedula, due_nombre, due_telefono, due_correo) VALUES (?, ?, ?, ?)',
            [due_cedula, due_nombre, due_telefono, due_correo]
        );
        res.status(201).json({ message: "Dueño registrado exitosamente", due_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar dueño" });
    }
};