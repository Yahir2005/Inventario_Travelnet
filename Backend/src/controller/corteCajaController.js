const CorteCaja = require('../model/corteCaja');

/**
 * ============================================================================
 * CONTROLADOR DE CORTE DE CAJA (corteCajaController.js)
 * ============================================================================
 * Gestiona las peticiones HTTP para listar, consultar, crear, editar y eliminar
 * los cierres de caja realizados por los cajeros/cobradores.
 */

/** Obtiene todos los cortes de caja con su lista de pagos incluidos */
const getAll = async (req,res) =>{
    try {
        const corteCaja = await CorteCaja.findAll(req.db);
        res.json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un corte de caja específico por su ID */
const getById = async (req,res) => {
    try {
        const corteCaja = await CorteCaja.findByPk(req.db,req.params.id);
        if(!corteCaja) return res.status(404).json({ error: 'Corte Caja no encontrada' });
        res.json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Registra un nuevo corte de caja tomando el `UsuarioId` del token JWT si está disponible */
const create = async (req,res) => {
    try {
        const payload = {
            ...req.body,
            UsuarioId: req.user?.id || req.body.UsuarioId
        };
        const corteCaja = await CorteCaja.create(req.db, payload);
        res.status(201).json(corteCaja);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza un corte de caja existente y su relación de pagos incluidos */
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

/** Elimina un corte de caja por su ID */
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