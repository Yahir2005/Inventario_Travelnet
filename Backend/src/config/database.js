const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const mysql = require('mariadb');

/**
 * ============================================================================
 * CONFIGURACIÓN DE CONEXIONES A MARIADB POR ROL (database.js)
 * ============================================================================
 * En lugar de usar un único usuario de base de datos para todo, este archivo
 * crea 4 "pools" (grupos de conexiones reutilizables) según el rol del empleado:
 * - `administrador`: Permisos completos.
 * - `mostrador`: Permisos para cobros, clientes y cortes de caja.
 * - `instalador`: Permisos para registrar instalaciones y fotos.
 * - `login`: Permisos mínimos para validar credenciales al iniciar sesión.
 */
let config = {};
try {
    config = require('../config/config.json');
} catch (_) {
    config = {};
}

// Configuración base del servidor de base de datos MariaDB
const baseConfig = {
    host: process.env.DB_HOST || config.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME || config.DB_NAME || 'Travelnet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Mapeo entre cada rol del sistema y las variables de entorno con su usuario/contraseña de BD
const credentials = [
    ['administrador', 'ADMIN_USER', 'ADMIN_PASS'],
    ['mostrador', 'MOSTRADOR_USER', 'MOSTRADOR_PASS'],
    ['instalador', 'INSTALADOR_USER', 'INSTALADOR_PASS'],
    ['login', 'LOGIN_USER', 'LOGIN_PASS']
];

// Inicializa los 4 pools de conexiones al arrancar el servidor
const pools = {};
for (const [rol, userKey, passKey] of credentials) {
    pools[rol] = mysql.createPool({
        ...baseConfig,
        user: process.env[userKey] || config[userKey],
        password: process.env[passKey] || config[passKey]
    });
}

/** Devuelve el pool de conexiones correspondiente al rol del usuario autenticado */
const getDbPool = (rol) => {
    switch (rol) {
        case 'Administrador': return pools.administrador;
        case 'Mostrador': return pools.mostrador;
        case 'Instalador': return pools.instalador;
        default: return pools.login;
    }
};

module.exports = getDbPool;