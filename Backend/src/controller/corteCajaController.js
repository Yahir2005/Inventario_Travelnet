const CorteCaja = require('../model/corteCaja');

const getAll = async (req,res) =>{
    try {
        const corteCaja = await CorteCaja.findAll(req.db);
        res.json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async (req,res) => {
    try {
        const corteCaja = await CorteCaja.findByPk(req.db,req.params.id);
        if(!corteCaja) return res.status(404).json({ error: 'Corte Caja no encontrada' });
        res.json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req,res) => {
    try {
        const corteCaja = await CorteCaja.create(req.db,req.body);
        res.status(201).json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req,res) => {
    try {
        const exist = await CorteCaja.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({ error: 'Corte Caja no encontrado'});

        const corteCajaUpdated = await CorteCaja.update(req.db,req.params.id,req.body);
        res.json(corteCajaUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const remove = async (req,res) =>{
    try {
        const removed = await CorteCaja.remove(req.db,req.params.id);
        if(!removed) return res.status(404).json({ error: 'Corte caja no encontrado'});
        res.json({ message: 'Corte de caja borrado correctamente'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };