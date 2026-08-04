const Torre = require('../model/Torre');

const getAll = async (req,res) => {
    try {
        const torre = await Torre.findAll(req.db);
        res.json(torre);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getById = async (req,res) => {
    try {
        const torre = await Torre.findByPk(req.db, req.params.id);
        if(!torre) return res.status(404).json({ error: 'Torre no encontrada'});
        res.json(torre);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const create = async (req,res) => {
    try {
        const torre = await Torre.create(req.db, req.body);
        res.status(201).json(torre);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const update = async (req,res) => {
    try {
        const exist = await Torre.findByPk(req.db, req.params.id);
        if(!exist) return res.status(404).json({ error: 'Torre no encontrada'});

        const torreUpdated = await Torre.update(req.db, req.params.id, req.body);
        res.json(torreUpdated);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {getAll, getById, create, update};