import { Router } from 'express';
import { getDuenos, registrarDueno, getCitas } from '../controladores/recepcionCtrl.js';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/duenos', verificarToken, verificarRol(['recepcion']), getDuenos);
router.post('/duenos', verificarToken, verificarRol(['recepcion']), registrarDueno);
router.get('/citas', verificarToken, verificarRol(['recepcion', 'veterinario']), getCitas);

export default router;