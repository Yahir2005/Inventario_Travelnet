const Imagen_Instalacion = require('../model/imagen_instalacion');

const getAll = async (req, res) => {
    try {
        const imagen_Instalacion = await Imagen_Instalacion.findAll(req.db);
        res.json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const imagen_Instalacion = await Imagen_Instalacion.findByPk(req.db, req.params.id);
        if(!imagen_Instalacion) return res.status(404).json({ error: 'Imagen instalación no encontrada' });
        res.json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const imagen_Instalacion = await Imagen_Instalacion.create(req.db, req.body);
        res.status(201).json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const exist = await Imagen_Instalacion.findByPk(req.db, req.params.id);
        if(!exist) return res.status(404).json({ error: 'Imagen instalación no encontrada' });

        const instalacion_ImagenUpdated = await Imagen_Instalacion.update(req.db, req.params.id, req.body);
        res.json(instalacion_ImagenUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update };