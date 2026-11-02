var express = require('express');
var router = express.Router();
var UsuarioController = require('../src/controller/usuarioController');

/**
 * ============================================================================
 * RUTAS DE USUARIOS Y AUTENTICACIÓN (/api/usuarios)
 * ============================================================================
 * Endpoints para iniciar sesión (`POST /api/usuarios/login`), consultar
 * usuarios activos y realizar el CRUD de empleados del sistema.
 */
router.post('/login',UsuarioController.login);
router.get('/activos',UsuarioController.getByActive);

router.get('/',UsuarioController.getAll);
router.post('/',UsuarioController.create);

router.get('/:id',UsuarioController.getById);
router.put('/:id',UsuarioController.update);
router.delete('/:id',UsuarioController.remove);

module.exports = router;