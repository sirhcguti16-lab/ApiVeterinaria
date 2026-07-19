import { Router } from 'express';
import { getClientes, createDueno } from '../controladores/clientesCtrl.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verificarToken, verificarRol(['recepcion', 'veterinario']), getClientes);

router.post('/', verificarToken, verificarRol(['recepcion']), createDueno);

export default router;