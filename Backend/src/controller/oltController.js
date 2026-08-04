const OLT = require('../model/OLT');

const getAll = async (req,res) => {
    try {
        const olt = await OLT.findAll(req.db);
        res.json(olt);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getById = async (req,res) => {
    try {
        const olt = await OLT.findByPk(req.db,req.params.id);
        if(!olt) return res.status(404).json({ error: 'OLT no encontrada'})
        res.json(olt);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const create = async (req,res) => {
    try {
        const olt = await OLT.create(req.db,req.body);
        res.status(201).json(olt);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const update = async (req,res) => {
    try {
        const exist = await OLT.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({ error: 'OLT no encontrada'});

        const oltUpdated = await OLT.update(req.db,req.params.id,req.body);
        res.json(oltUpdated);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {getAll,getById,create,update};