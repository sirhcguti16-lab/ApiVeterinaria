import { Router } from 'express';
import { crearReceta, despacharReceta } from '../controladores/recetasCtrl.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, verificarRol(['veterinario']), crearReceta);

router.put('/:id/despachar', verificarToken, verificarRol(['farmacia']), despacharReceta);

export default router;