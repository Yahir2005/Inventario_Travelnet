const Torre = require('../model/Torre');

/**
 * ============================================================================
 * CONTROLADOR DE TORRES (torreController.js)
 * ============================================================================
 * Procesa las peticiones HTTP para listar, consultar por ID, registrar y
 * actualizar las torres de telecomunicaciones (enlaces por Antena).
 */

/** Obtiene todas las torres registradas */
const getAll = async (req,res) => {
    try {
        const torre = await Torre.findAll(req.db);
        res.json(torre);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Obtiene una torre específica por su ID */
const getById = async (req,res) => {
    try {
        const torre = await Torre.findByPk(req.db, req.params.id);
        if(!torre) return res.status(404).json({ error: 'Torre no encontrada'});
        res.json(torre);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Crea una nueva torre en la base de datos */
const create = async (req,res) => {
    try {
        const torre = await Torre.create(req.db, req.body);
        res.status(201).json(torre);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Actualiza el nombre o la ubicación de una torre existente */
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