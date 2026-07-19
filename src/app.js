 import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import recetasRoutes from "./routes/recetas.routes.js";

const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/recetas', recetasRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API Veterinaria operando correctamente en Clever Cloud" });
});

export default app;