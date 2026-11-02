const PagoMesCancelado = require('../model/PagoMesCancelado');

/**
 * ============================================================================
 * CONTROLADOR DE MENSUALIDADES CANCELADAS (pagoMesCanceladoController.js)
 * ============================================================================
 * Permite consultar y administrar la bitácora de auditoría de mensualidades
 * que han sido canceladas o dadas de baja, incluyendo el motivo y el usuario.
 */

/** Obtiene todos los registros de mensualidades canceladas */
const getAll = async (req,res) => {
    try {
        const pagoMesCancelado = await PagoMesCancelado.findAll(req.db);
        res.json(pagoMesCancelado); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un registro de cancelación específico por su ID */
const getById = async (req,res) => {
    try {
        const pagoMesCancelado = await PagoMesCancelado.findByPk(req.db,req.params.id);
        if(!pagoMesCancelado) return res.status(404).json({ error: 'Pago mes cancelado no encontrado'});
        res.json(pagoMesCancelado);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Crea un nuevo registro en la bitácora de cancelaciones */
const create = async (req,res) => {
    try {
        const pagoMesCancelado = await PagoMesCancelado.create(req.db,req.body);
        res.status(201).json(pagoMesCancelado);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
}

/** Actualiza el motivo u observaciones de un registro de cancelación */
const update = async (req,res) => {
    try {
        const exist = await PagoMesCancelado.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({ error: 'Pago mes cancelado no encontrado'});

        const pagoMesCanceladoUpdated = await PagoMesCancelado.update(req.db,req.params.id,req.body);
        res.json(pagoMesCanceladoUpdated);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

module.exports = { getAll,getById,create,update}