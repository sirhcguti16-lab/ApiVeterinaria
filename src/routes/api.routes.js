import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

import { getDuenos, registrarDueno, getCitas } from '../controladores/recepcionCtrl.js';
import { getCitasPendientes, atenderCita } from '../controladores/veterinarioCtrl.js';
import { getMedicamentos, actualizarStock, getRecetasPendientes } from '../controladores/farmaciaCtrl.js';

const router = Router();

// Todo lo que esté en este archivo requerirá token
router.use(verificarToken);

// --- RECEPCIÓN ---
router.get('/recepcion/duenos', verificarRol(['recepcion']), getDuenos);
router.post('/recepcion/duenos', verificarRol(['recepcion']), registrarDueno);
router.get('/recepcion/citas', verificarRol(['recepcion', 'veterinario']), getCitas);

// --- VETERINARIO ---
router.get('/veterinario/citas', verificarRol(['veterinario']), getCitasPendientes);
router.put('/veterinario/citas/:id', verificarRol(['veterinario']), atenderCita);

// --- FARMACIA ---
router.get('/farmacia/medicamentos', verificarRol(['farmacia', 'veterinario']), getMedicamentos);
router.put('/farmacia/medicamentos/:id', verificarRol(['farmacia']), actualizarStock);
router.get('/farmacia/recetas', verificarRol(['farmacia']), getRecetasPendientes);

export default router;