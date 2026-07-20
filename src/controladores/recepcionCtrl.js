export const editarDueno = async (req, res) => {
    try {
        const { id } = req.params;
        const { due_nombre, due_telefono, due_correo } = req.body;
        await pool.query(
            'UPDATE duenos SET due_nombre = ?, due_telefono = ?, due_correo = ? WHERE due_id = ?',
            [due_nombre, due_telefono, due_correo, id]
        );
        res.json({ message: 'Dueño actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar dueño' });
    }
};

export const editarMascota = async (req, res) => {
    try {
        const { id } = req.params;
        const { mas_nombre, mas_especie, mas_raza, mas_peso } = req.body;
        await pool.query(
            'UPDATE mascotas SET mas_nombre = ?, mas_especie = ?, mas_raza = ?, mas_peso = ? WHERE mas_id = ?',
            [mas_nombre, mas_especie, mas_raza, mas_peso, id]
        );
        res.json({ message: 'Mascota actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar mascota' });
    }
};
