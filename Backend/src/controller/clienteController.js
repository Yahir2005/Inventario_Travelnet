const Cliente =  require('../model/cliente');
const jwt = require('jsonwebtoken');

const getAll = async (req,res) => {
    try {
        const cliente = await Cliente.findAll(req.db);
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const getById = async (req,res) => {
    try {
        const cliente = await Cliente.findByPk(req.db,req.params.id);
        if(!cliente) return res.status(404).json({ error: 'Cliente no encontrado'});
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const create = async (req,res) => {
    try {
        const cliente = await Cliente.create(req.db,req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const update = async (req,res) => {
    try {
        const exist = await Cliente.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({ error: 'Cliente no encontrado'});

        const clienteUpdated = await Cliente.update(req.params.id, req.body);
        res.json(clienteUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const remove = async (req,res) => {
    try {
        const delated = await Cliente.remove(req.db,req.params.id);
        if(!delated) return res.status(404).json({ error: 'Cliente no encontrado'});
        res.json({message: 'Cliente desactivado correctamente'});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const getClienteInstallationsList = async (req, res) => {
    try {
        const clientesDetallados = await Cliente.clientInstallationList(req.db);
        res.json(clientesDetallados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove, getClienteInstallationsList};