import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const headerAuth = req.headers['authorization'];
    
    if (!headerAuth) {
        return res.status(403).json({ message: 'No se proporcionó un token de seguridad' });
    }

    const token = headerAuth.split(" ")[1]; 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRETO_VETERINARIA');
        req.usuario = decoded;
        next(); 
    } catch (error) {
        // Al estar dentro de la función, este return ya no será ilegal
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

export const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
            });
        }
        next();
    };
};