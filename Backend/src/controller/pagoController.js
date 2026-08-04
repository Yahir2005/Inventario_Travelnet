const Pago = require('../model/pago');

const getAll = async (req,res) => {
    try {
        const pago = await Pago.findAll(req.db);
        res.json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getById = async ( req,res ) => {
    try {
        const pago = await Pago.findByPk(req.db,req.params.id);
        if(!pago) return res.status(404).json({ error: 'Pago no encontrado'});
        res.json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const create = async (req, res) => {
    try {
        const pago = await Pago.create(req.db,req.body);
        res.status(201).json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const update = async (req,res) => {
    try {
        const exist = await Pago.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({error: 'Pago no encontrado'});

        const pagoUpdated = await Pago.update(req.db,req.params.id,req.body);
        res.json(pagoUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

module.exports = { getAll, getById, create, update}