import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

import { 
    getDuenos, registrarDueno, getCitas, getVeterinarios, 
    getMascotas, agendarCita, editarDueno, editarMascota 
} from '../controladores/recepcionCtrl.js';

import { getCitasPendientes, atenderCita } from '../controladores/veterinarioCtrl.js';

import { 
    getMedicamentos, actualizarStock, editarMedicamento, 
    getRecetasPendientes, despacharReceta, getRecetasDespachadas 
} from '../controladores/farmaciaCtrl.js';

import { crearReceta } from '../controladores/recetasCtrl.js';

const router = Router();

router.use(verificarToken);

// --- RECEPCIÓN ---
router.get('/recepcion/duenos', verificarRol(['recepcion']), getDuenos);
router.post('/recepcion/duenos', verificarRol(['recepcion']), registrarDueno);
router.put('/recepcion/duenos/:id', verificarRol(['recepcion']), editarDueno);

router.get('/recepcion/mascotas', verificarRol(['recepcion']), getMascotas);
router.put('/recepcion/mascotas/:id', verificarRol(['recepcion']), editarMascota);

router.get('/recepcion/citas', verificarRol(['recepcion', 'veterinario']), getCitas);
router.post('/recepcion/citas', verificarRol(['recepcion']), agendarCita);

router.get('/recepcion/veterinarios', verificarRol(['recepcion']), getVeterinarios);

// --- VETERINARIO ---
router.get('/veterinario/citas', verificarRol(['veterinario']), getCitasPendientes);
router.put('/veterinario/citas/:id', verificarRol(['veterinario']), atenderCita);
router.post('/recetas', verificarRol(['veterinario']), crearReceta);

// --- FARMACIA ---
// 1. Rutas de Medicamentos (Faltaba la ruta GET)
router.get('/farmacia/medicamentos', verificarRol(['farmacia', 'veterinario']), getMedicamentos);
router.put('/farmacia/medicamentos/:id', verificarRol(['farmacia']), editarMedicamento);
router.put('/farmacia/medicamentos/stock/:id', verificarRol(['farmacia']), actualizarStock);

// 2. Rutas de Recetas (Eliminados los duplicados)
router.get('/farmacia/recetas/pendientes', verificarRol(['farmacia', 'veterinario']), getRecetasPendientes);
router.get('/farmacia/recetas/despachadas', verificarRol(['farmacia', 'veterinario']), getRecetasDespachadas);
router.put('/farmacia/recetas/despachar/:id', verificarRol(['farmacia']), despacharReceta);
export default router;
