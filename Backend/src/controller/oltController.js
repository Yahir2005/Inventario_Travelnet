const OLT = require('../model/OLT');

/**
 * ============================================================================
 * CONTROLADOR DE EQUIPOS OLT (oltController.js)
 * ============================================================================
 * Procesa las peticiones HTTP para listar, consultar por ID, crear y actualizar
 * las terminales de fibra óptica (OLT).
 */

/** Obtiene todas las OLTs registradas */
const getAll = async (req,res) => {
    try {
        const olt = await OLT.findAll(req.db);
        res.json(olt);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Obtiene una OLT específica por su ID */
const getById = async (req,res) => {
    try {
        const olt = await OLT.findByPk(req.db,req.params.id);
        if(!olt) return res.status(404).json({ error: 'OLT no encontrada'})
        res.json(olt);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Crea una nueva OLT */
const create = async (req,res) => {
    try {
        const olt = await OLT.create(req.db,req.body);
        res.status(201).json(olt);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Actualiza el nombre o ubicación de una OLT existente */
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