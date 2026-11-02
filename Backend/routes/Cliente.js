var express = require('express');
var router = express.Router();
var clienteController = require('../src/controller/clienteController');

/**
 * ============================================================================
 * RUTAS DE CLIENTES (/api/cliente)
 * ============================================================================
 * Conecta las peticiones HTTP de Angular con el controlador `clienteController`:
 * - GET /api/cliente/lista-detallada -> Clientes con su conteo de instalaciones y última foto.
 * - GET /api/cliente                 -> Catálogo básico de clientes.
 * - GET /api/cliente/:id             -> Obtener un cliente por ID.
 * - POST /api/cliente                -> Crear un cliente nuevo.
 * - PUT /api/cliente/:id             -> Actualizar datos o estado de un cliente.
 * - DELETE /api/cliente/:id          -> Eliminar un cliente.
 */
router.get('/lista-detallada',clienteController.getClienteInstallationsList);

router.get('/',clienteController.getAll);
router.get('/:id',clienteController.getById);
router.post('/',clienteController.create);
router.put('/:id',clienteController.update);
router.delete('/:id',clienteController.remove);

module.exports = router;
