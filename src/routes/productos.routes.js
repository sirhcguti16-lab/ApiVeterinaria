import { Router } from 'express';
import { getProductos, agregarStock } from '../controladores/productosCtrl.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verificarToken, verificarRol(['veterinario', 'farmacia']), getProductos);

router.post('/stock', verificarToken, verificarRol(['farmacia']), agregarStock);

export default router;