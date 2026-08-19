const Instalacion = require('../model/instalacion');

const getAll = async (req, res) => {
    try {
        const instalacion = await Instalacion.findAll(req.db);
        res.json(instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllDetallado = async (req, res) => {
    try {
        const instalaciones = await Instalacion.findAllDetallado(req.db);
        res.json(instalaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const instalacion = await Instalacion.findByPk(req.db, req.params.id);
        if(!instalacion) return res.status(404).json({ error: 'Instalación no encontrada' });
        res.json(instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const instalacion = await Instalacion.create(req.db, req.body);
        res.status(201).json(instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const exist = await Instalacion.findByPk(req.db, req.params.id);
        if(!exist) return res.status(404).json({ error: 'Instalacion no encontrada' });

        const dataToUpdate = { ...exist, ...req.body };
        
        const instalacionUpdated = await Instalacion.update(req.db, req.params.id, dataToUpdate);
        
        res.json(instalacionUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const deleted = await Instalacion.remove(req.db, req.params.id);
        if(!deleted) return res.status(404).json({ error: 'Instalacion no encontrada' });
        res.json({ message: 'Instalacion desactivada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getAllDetallado, getById, create, update, remove };