const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const mysql = require('mariadb');
// Verifica que la ruta '../config/config.json' apunte exactamente donde guardaste el archivo
const config = require('../config/config.json');

const baseConfig = {
    host: process.env.DB_HOST || config.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME || config.DB_NAME || 'Travelnet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const credentials = [
    ['administrador', 'ADMIN_USER', 'ADMIN_PASS'],
    ['mostrador', 'MOSTRADOR_USER', 'MOSTRADOR_PASS'],
    ['instalador', 'INSTALADOR_USER', 'INSTALADOR_PASS'],
    ['login', 'LOGIN_USER', 'LOGIN_PASS']
];

const pools = {};
for (const [rol, userKey, passKey] of credentials) {
    pools[rol] = mysql.createPool({
        ...baseConfig,
        user: process.env[userKey] || config[userKey],
        password: process.env[passKey] || config[passKey]
    });
}

const getDbPool = (rol) => {
    switch (rol) {
        case 'Administrador': return pools.administrador;
        case 'Mostrador': return pools.mostrador;
        case 'Instalador': return pools.instalador;
        default: return pools.login;
    }
};

module.exports = getDbPool;