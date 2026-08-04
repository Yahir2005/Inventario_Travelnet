const mysql = require('mariadb');
// Verifica que la ruta '../config/config.json' apunte exactamente donde guardaste el archivo
const config = require('../config/config.json');

const baseConfig = {
    // Corregido: Ahora lee desde config en lugar de process.env
    host: config.DB_HOST || 'localhost',
    port: 3306,
    database: config.DB_NAME || 'Travelnet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pools = {
    administrador: mysql.createPool({
        ...baseConfig,
        user: config.ADMIN_USER,
        password: config.ADMIN_PASS
    }),
    mostrador: mysql.createPool({
        ...baseConfig,
        user: config.MOSTRADOR_USER,
        password: config.MOSTRADOR_PASS
    }),
    instalador: mysql.createPool({
        ...baseConfig,
        user: config.INSTALADOR_USER,
        password: config.INSTALADOR_PASS
    }),
    login: mysql.createPool({
        ...baseConfig,
        user: config.LOGIN_USER,
        password: config.LOGIN_PASS
    })
};

const getDbPool = (rol) => {
    switch (rol) {
        case 'Administrador': return pools.administrador;
        case 'Mostrador': return pools.mostrador;
        case 'Instalador': return pools.instalador;
        default: return pools.login;
    }
};

module.exports = getDbPool;