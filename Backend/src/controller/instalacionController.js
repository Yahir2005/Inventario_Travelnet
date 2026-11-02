const Instalacion = require('../model/instalacion');

/**
 * ============================================================================
 * CONTROLADOR DE INSTALACIONES (instalacionController.js)
 * ============================================================================
 * Procesa las solicitudes HTTP para consultar, crear, editar y desactivar
 * las instalaciones de internet de los clientes.
 */

/** Obtiene la lista básica de instalaciones */
const getAll = async (req, res) => {
    try {
        const instalacion = await Instalacion.findAll(req.db);
        res.json(instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene la lista detallada de instalaciones (incluyendo cliente, plan, localidad, OLT/Torre y última foto) */
const getAllDetallado = async (req, res) => {
    try {
        const instalaciones = await Instalacion.findAllDetallado(req.db);
        res.json(instalaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene una instalación específica por su ID */
const getById = async (req, res) => {
    try {
        const instalacion = await Instalacion.findByPk(req.db, req.params.id);
        if(!instalacion) return res.status(404).json({ error: 'Instalación no encontrada' });
        res.json(instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Registra una nueva instalación verificando `ClienteId` y `LocalidadId` */
const create = async (req, res) => {
    try {
        if (!req.body.ClienteId || !req.body.LocalidadId) {
            return res.status(400).json({ error: 'ClienteId y LocalidadId son requeridos' });
        }
        const payload = {
            ...req.body,
            UsuarioId: req.user?.id || req.body.UsuarioId
        };
        const instalacion = await Instalacion.create(req.db, payload);
        res.status(201).json(instalacion);
    } catch (error) {
        const isValidation = /requerido|inválido|no existe/i.test(error.message);
        res.status(isValidation ? 400 : 500).json({ error: error.message });
    }
};

/** Actualiza los datos técnicos o el estado (`Active`) de una instalación */
const update = async (req, res) => {
    try {
        const exist = await Instalacion.findByPk(req.db, req.params.id);
        if(!exist) return res.status(404).json({ error: 'Instalacion no encontrada' });

        const instalacionUpdated = await Instalacion.update(req.db, req.params.id, req.body);
        
        res.json(instalacionUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Desactiva o elimina una instalación por su ID */
const remove = async (req, res) => {
    try {
        const deleted = await Instalacion.remove(req.db, req.params.id);
        if(!deleted) return res.status(404).json({ error: 'Instalacion no encontrada' });
        res.json({ message: 'Instalacion desactivada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getAllDetallado, getById, create, update, remove };