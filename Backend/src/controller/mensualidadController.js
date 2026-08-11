const Mensualidad = require('../model/mensualidad');

const getAll = async (req, res) => {
    try {
        const mensualidades = await Mensualidad.findAll(req.db);
        res.json(mensualidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const mensualidad = await Mensualidad.findByPk(req.db, req.params.id);
        if (!mensualidad) return res.status(404).json({ error: 'Mensualidad no encontrada' });
        res.json(mensualidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getByInstalacion = async (req, res) => {
    try {
        const mensualidades = await Mensualidad.findByInstalacion(req.db, req.params.instalacionId);
        res.json(mensualidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const mensualidad = await Mensualidad.create(req.db, req.body);
        res.status(201).json(mensualidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const exist = await Mensualidad.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Mensualidad no encontrada' });

        const mensualidadUpdated = await Mensualidad.update(req.db, req.params.id, req.body);
        res.json(mensualidadUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cancelar = async (req, res) => {
    try {
        const { MensualidadId, Motivo } = req.body;
        if (!MensualidadId || !Motivo) {
            return res.status(400).json({ error: 'MensualidadId y Motivo son requeridos' });
        }
        const exist = await Mensualidad.findByPk(req.db, MensualidadId);
        if (!exist) return res.status(404).json({ error: 'Mensualidad no encontrada' });

        const cancelacion = await Mensualidad.cancelar(req.db, MensualidadId, Motivo);
        res.json({ message: 'Pago de mensualidad dado de baja correctamente', data: cancelacion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const removed = await Mensualidad.remove(req.db, req.params.id);
        if (!removed) return res.status(404).json({ error: 'Mensualidad no encontrada' });
        res.json({ message: 'Mensualidad desactivada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, getByInstalacion, create, update, cancelar, remove };