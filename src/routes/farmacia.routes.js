import { Router } from 'express';
import { 
    getMedicamentos, 
    actualizarStock, 
    getRecetasPendientes, 
    getRecetasDespachadas, 
    despacharReceta 
} from '../controladores/farmaciaCtrl.js'; 
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/medicamentos', verificarToken, verificarRol(['farmacia', 'veterinario']), getMedicamentos);
router.put('/medicamentos/:id', verificarToken, verificarRol(['farmacia']), actualizarStock);

router.get('/recetas/pendientes', verificarToken, verificarRol(['farmacia']), getRecetasPendientes);

router.get('/recetas/despachadas', verificarToken, verificarRol(['farmacia']), getRecetasDespachadas);
router.put('/recetas/despachar/:id', verificarToken, verificarRol(['farmacia']), despacharReceta);

export default router;
