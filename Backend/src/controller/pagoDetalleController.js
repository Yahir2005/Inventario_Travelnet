const PagoDetalle = require('../model/pagoDetalle');

/**
 * ============================================================================
 * CONTROLADOR DE DETALLE DE PAGOS (pagoDetalleController.js)
 * ============================================================================
 * Administra los registros de la tabla `Pago_Detalle`, que vinculan un cobro
 * (`PagoId`) con cada mes cubierto (`MensualidadId`) y su `MontoAplicado`.
 */

/** Obtiene todos los detalles de pago */
const getAll = async (req, res) => {
    try {
        const detalles = await PagoDetalle.findAll(req.db);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un detalle de pago por su ID */
const getById = async (req, res) => {
    try {
        const detalle = await PagoDetalle.findByPk(req.db, req.params.id);
        if (!detalle) return res.status(404).json({ error: 'Detalle de pago no encontrado' });
        res.json(detalle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea un nuevo registro en `Pago_Detalle` */
const create = async (req, res) => {
    try {
        const detalle = await PagoDetalle.create(req.db, req.body);
        res.status(201).json(detalle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza un registro existente de `Pago_Detalle` */
const update = async (req, res) => {
    try {
        const exist = await PagoDetalle.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Detalle de pago no encontrado' });

        const detalleUpdated = await PagoDetalle.update(req.db, req.params.id, req.body);
        res.json(detalleUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Elimina un registro de `Pago_Detalle` por su ID */
const remove = async (req, res) => {
    try {
        const removed = await PagoDetalle.remove(req.db, req.params.id);
        if (!removed) return res.status(404).json({ error: 'Detalle de pago no encontrado' });
        res.json({ message: 'Detalle de pago eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };