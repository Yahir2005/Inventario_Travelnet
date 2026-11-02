const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

/**
 * ============================================================================
 * CONFIGURACIÓN DE LA LLAVE SECRETA JWT (jwt.js)
 * ============================================================================
 * Provee la clave secreta (`JWT_SECRET`) con la que el servidor firma y verifica
 * los tokens de sesión. Exige que tenga al menos 16 caracteres por seguridad.
 */
let config = {};
try {
    config = require('./config.json');
} catch (_) {
    config = {};
}

/** Obtiene y valida la clave secreta JWT desde `.env` o `config.json` */
const getSecret = () => {
    const secret = process.env.JWT_SECRET || config.JWT_SECRET;
    if (!secret || typeof secret !== 'string' || secret.trim().length < 16) {
        throw new Error('Configuración crítica faltante: JWT_SECRET debe estar definido y tener al menos 16 caracteres.');
    }
    return secret;
};

module.exports = { getSecret };
