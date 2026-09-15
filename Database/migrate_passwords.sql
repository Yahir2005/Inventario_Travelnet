-- Migración de contraseñas (Fase 1, punto 1.2)
-- Ejecuta primero este script de esquema y luego Backend/scripts/migrate_passwords.js
--
-- Los hashes bcrypt generan 60 caracteres; la columna actual (VARCHAR(50)) no los soporta.

USE Travelnet;

ALTER TABLE Usuario MODIFY COLUMN Password VARCHAR(100);