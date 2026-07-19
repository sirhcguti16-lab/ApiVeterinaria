import { Router } from 'express';
import { getMedicamentos, actualizarStock, getRecetasPendientes } from '../controladores/farmacia.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/medicamentos', verificarToken, verificarRol(['farmacia', 'veterinario']), getMedicamentos);
router.put('/medicamentos/:id', verificarToken, verificarRol(['farmacia']), actualizarStock);
router.get('/recetas', verificarToken, verificarRol(['farmacia']), getRecetasPendientes);

export default router;