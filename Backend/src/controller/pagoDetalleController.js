const PagoDetalle = require('../model/pagoDetalle');

const getAll = async (req, res) => {
    try {
        const detalles = await PagoDetalle.findAll(req.db);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const detalle = await PagoDetalle.findByPk(req.db, req.params.id);
        if (!detalle) return res.status(404).json({ error: 'Detalle de pago no encontrado' });
        res.json(detalle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const detalle = await PagoDetalle.create(req.db, req.body);
        res.status(201).json(detalle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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