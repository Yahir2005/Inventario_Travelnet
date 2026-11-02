var express = require('express');
var router = express.Router();
var imagen_InstalacionController = require('../src/controller/imagen_InstalacionController');

/**
 * ============================================================================
 * RUTAS DE IMÁGENES DE INSTALACIÓN (/api/imagenInstalacion)
 * ============================================================================
 * Endpoints para consultar y subir fotografías de evidencia técnica (en Base64)
 * asociadas a una instalación.
 */
router.get('/',imagen_InstalacionController.getAll);
router.get('/:id',imagen_InstalacionController.getById);
router.post('/',imagen_InstalacionController.create);
router.put('/:id',imagen_InstalacionController.update);

module.exports = router;