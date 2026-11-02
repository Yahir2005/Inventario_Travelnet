const Mensualidad = require('../model/mensualidad');

/**
 * ============================================================================
 * CONTROLADOR DE MENSUALIDADES (mensualidadController.js)
 * ============================================================================
 * Administra los meses facturados/pagados por cada instalación, permitiendo
 * listar el historial por instalación, editar un mes o darlo de baja con motivo.
 */

/** Obtiene todas las mensualidades activas */
const getAll = async (req, res) => {
    try {
        const mensualidades = await Mensualidad.findAll(req.db);
        res.json(mensualidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene una mensualidad específica por su ID */
const getById = async (req, res) => {
    try {
        const mensualidad = await Mensualidad.findByPk(req.db, req.params.id);
        if (!mensualidad) return res.status(404).json({ error: 'Mensualidad no encontrada' });
        res.json(mensualidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene todas las mensualidades asociadas a un `instalacionId` específico */
const getByInstalacion = async (req, res) => {
    try {
        const mensualidades = await Mensualidad.findByInstalacion(req.db, req.params.instalacionId);
        res.json(mensualidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Crea manualmente un registro de mensualidad validando `InstalacionId`, `Mes` y `Anio` */
const create = async (req, res) => {
    try {
        if (!req.body.InstalacionId || !req.body.Mes || !req.body.Anio) {
            return res.status(400).json({ error: 'InstalacionId, Mes y Anio son requeridos' });
        }
        const mensualidad = await Mensualidad.create(req.db, req.body);
        res.status(201).json(mensualidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza los datos de una mensualidad existente */
const update = async (req, res) => {
    try {
        const exist = await Mensualidad.findByPk(req.db, req.params.id);
        if (!exist) return res.status(404).json({ error: 'Mensualidad no encontrada' });

        const mensualidadUpdated = await Mensualidad.update(req.db, req.params.id, req.body);
        res.json(mensualidadUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Da de baja una mensualidad pagada y guarda quién y por qué la canceló en `PagoMesCancelado` */
const cancelar = async (req, res) => {
    try {
        const { MensualidadId, Motivo, PagoId, UsuarioId, MotivoId, Observaciones } = req.body;
        const motivoTexto = Motivo || Observaciones;
        if (!MensualidadId || (!motivoTexto && !MotivoId)) {
            return res.status(400).json({ error: 'MensualidadId y Motivo (o MotivoId) son requeridos' });
        }
        const exist = await Mensualidad.findByPk(req.db, MensualidadId);
        if (!exist) return res.status(404).json({ error: 'Mensualidad no encontrada' });

        const cancelacion = await Mensualidad.cancelar(req.db, MensualidadId, motivoTexto, {
            PagoId,
            UsuarioId: req.user?.id || UsuarioId,
            MotivoId,
            Observaciones
        });
        res.json({ message: 'Pago de mensualidad dado de baja correctamente', data: cancelacion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Desactiva lógicamente (`Active = 0`) una mensualidad */
const remove = async (req, res) => {
    try {
        const removed = await Mensualidad.remove(req.db, req.params.id);
        if (!removed) return res.status(404).json({ error: 'Mensualidad no encontrada' });
        res.json({ message: 'Mensualidad desactivada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, getByInstalacion, create, update, cancelar, remove };