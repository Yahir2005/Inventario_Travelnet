const getDbPool = require('../config/database');

/**
 * ============================================================================
 * MIDDLEWARE SELECTOR DE BASE DE DATOS (dbSelector.js)
 * ============================================================================
 * Asigna en `req.db` el pool de conexiones de MariaDB que corresponde al rol
 * (`Ocupacion`) del usuario autenticado antes de pasar al controlador.
 */
const dbSelector = (req,res,next) => {
    const userRole = req.user ? req.user.Ocupacion : null;

    req.db = getDbPool(userRole);
    next();
};

module.exports = dbSelector;