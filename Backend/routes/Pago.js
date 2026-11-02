var express = require('express');
var router = express.Router();
var pagoController = require('../src/controller/pagoController');

/**
 * ============================================================================
 * RUTAS DE PAGOS Y COBRANZA (/api/pago)
 * ============================================================================
 * Endpoints principales de cobranza:
 * - GET  /api/pago                  -> Lista de instalaciones con su último estado de pago y atraso.
 * - GET  /api/pago/exportar         -> Datos completos para generar el reporte en Excel.
 * - GET  /api/pago/pendientes-corte -> Pagos en efectivo pendientes de incluir en un Corte de Caja.
 * - POST /api/pago/desglose         -> Desglose de una lista de IDs de pago para ver detalles de un corte.
 * - POST /api/pago/procesar         -> Procesa un pago mediante procedimiento almacenado.
 * - GET / POST / PUT                -> Operaciones CRUD de un pago individual.
 */
router.get('/',pagoController.getAll);
router.get('/exportar', pagoController.getExportar);
router.get('/pendientes-corte', pagoController.getPendientesCorte);
router.post('/desglose', pagoController.getDesglose);
router.post('/procesar', pagoController.procesarPago);
router.get('/:id',pagoController.getById);
router.post('/',pagoController.create);
router.put('/:id',pagoController.update);

module.exports = router;