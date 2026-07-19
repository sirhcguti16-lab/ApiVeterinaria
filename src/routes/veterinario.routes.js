import { Router } from 'express';
import { getCitasPendientes, atenderCita } from '../controladores/veterinarioCtrl.js'; 
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/citas', verificarToken, verificarRol(['veterinario']), getCitasPendientes);
router.put('/citas/:id', verificarToken, verificarRol(['veterinario']), atenderCita);

export default router;