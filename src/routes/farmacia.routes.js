import { Router } from 'express';
import { 
    getMedicamentos, 
    crearMedicamento,
    actualizarStock, 
    getRecetasPendientes, 
    getRecetasDespachadas, 
    despacharReceta,
    getRecetaPorId
} from '../controladores/farmaciaCtrl.js'; 
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/medicamentos', verificarToken, verificarRol(['farmacia', 'veterinario']), getMedicamentos);
router.post('/medicamentos', verificarToken, verificarRol(['farmacia']), crearMedicamento);
router.put('/medicamentos/:id', verificarToken, verificarRol(['farmacia']), actualizarStock);

router.get('/recetas/pendientes', verificarToken, verificarRol(['farmacia']), getRecetasPendientes);
router.get('/recetas/despachadas', verificarToken, verificarRol(['farmacia']), getRecetasDespachadas);
router.put('/recetas/despachar/:id', verificarToken, verificarRol(['farmacia']), despacharReceta);
router.get('/recetas/:id', verificarToken, verificarRol(['farmacia', 'veterinario']), getRecetaPorId);

export default router;
