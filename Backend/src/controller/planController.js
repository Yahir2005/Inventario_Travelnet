const Plan = require('../model/plan');

/**
 * ============================================================================
 * CONTROLADOR DE PLANES Y TARIFAS (planController.js)
 * ============================================================================
 * Gestiona tanto los planes de velocidad (`Plan`: ej. 20 Mbps, 50 Mbps)
 * como sus precios por modalidad de pago (`PlanTarifa`: Mensual, Anual, etc.).
 */

/** Obtiene todos los planes con su arreglo de tarifas incluidas */
const getAll = async (req, res) => {
    try {
        const planes = await Plan.findAll(req.db);
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un plan específico por su ID junto con sus tarifas */
const getById = async (req, res) => {
    try {
        const plan = await Plan.findByPk(req.db, req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea un nuevo plan y sus tarifas iniciales */
const create = async (req, res) => {
    try {
        const plan = await Plan.create(req.db, req.body);
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza el nombre, velocidad o estado activo de un plan */
const update = async (req, res) => {
    try {
        const exist = await Plan.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Plan no encontrado' });

        const planUpdated = await Plan.update(req.db, req.params.id, req.body);
        res.json(planUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Desactiva lógicamente (`Active = 0`) un plan */
const remove = async (req, res) => {
    try {
        const deleted = await Plan.remove(req.db, req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Plan no encontrado' });
        res.json({ message: 'Plan desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene el listado plano de todas las tarifas de todos los planes */
const getAllTarifas = async (req, res) => {
    try {
        const tarifas = await Plan.findAllTarifas(req.db);
        res.json(tarifas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene una tarifa específica por su `TarifaId` */
const getTarifaById = async (req, res) => {
    try {
        const tarifa = await Plan.findTarifaByPk(req.db, req.params.id);
        if (!tarifa) return res.status(404).json({ error: 'Tarifa no encontrada' });
        res.json(tarifa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea una nueva tarifa asociada a un `PlanId` */
const createTarifa = async (req, res) => {
    try {
        const tarifa = await Plan.createTarifa(req.db, req.body);
        res.status(201).json(tarifa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza la modalidad o el precio de una tarifa existente */
const updateTarifa = async (req, res) => {
    try {
        const exist = await Plan.findTarifaByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Tarifa no encontrada' });

        const tarifaUpdated = await Plan.updateTarifa(req.db, req.params.id, req.body);
        res.json(tarifaUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Elimina una tarifa por su `TarifaId` */
const removeTarifa = async (req, res) => {
    try {
        const deleted = await Plan.removeTarifa(req.db, req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Tarifa no encontrada' });
        res.json({ message: 'Tarifa eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getAllTarifas,
    getTarifaById,
    createTarifa,
    updateTarifa,
    removeTarifa
};
