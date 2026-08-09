#!/usr/bin/env node
/**
 * Migración de contraseñas (Fase 1, punto 1.2)
 *
 * Hashea las contraseñas existentes en texto plano de la tabla Usuario con bcrypt.
 *  - Amplía la columna Password a VARCHAR(100) si aún es VARCHAR(50).
 *  - Detecta filas cuyo Password no tiene prefijo bcrypt ($2) y las hashea.
 *
 * Requiere credenciales de ADMIN en .env (o config.json). Uso:
 *   cd Backend && npm run migrate:passwords
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const getDbPool = require('../src/config/database');

const SALT_ROUNDS = 10;
const BCRYPT_PREFIX = /^\$2[aby]\$/;

(async () => {
    const pool = getDbPool('Administrador');
    let conn;
    try {
        conn = await pool.getConnection();

        const [{ MaxLength: maxLength }] = await conn.query(
            'SELECT CHARACTER_MAXIMUM_LENGTH AS MaxLength FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "Usuario" AND COLUMN_NAME = "Password"'
        );

        if (!maxLength || maxLength < 100) {
            await conn.query('ALTER TABLE Usuario MODIFY COLUMN Password VARCHAR(100)');
            console.log('✔ Columna Password ampliada a VARCHAR(100).');
        }

        const usuarios = await conn.query('SELECT UsuarioId, Usuario, Password FROM Usuario');

        let actualizados = 0;
        for (const u of usuarios) {
            if (u.Password && BCRYPT_PREFIX.test(u.Password)) {
                continue;
            }
            const hash = u.Password ? bcrypt.hashSync(u.Password, SALT_ROUNDS) : bcrypt.hashSync('', SALT_ROUNDS);
            await conn.query('UPDATE Usuario SET Password = ? WHERE UsuarioId = ?', [hash, u.UsuarioId]);
            console.log(`✔ Usuario "${u.Usuario}" (id ${u.UsuarioId}): contraseña hasheada.`);
            actualizados++;
        }

        console.log(`\nMigración completada: ${actualizados} contraseña(s) procesada(s), ${usuarios.length} usuario(s) en total.`);
        process.exit(0);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
})().catch((err) => {
    console.error('❌ Error en la migración:', err.message);
    process.exit(1);
});