const Pago = require('../model/pago');

/**
 * ============================================================================
 * CONTROLADOR DE PAGOS Y COBRANZA (pagoController.js)
 * ============================================================================
 * Atiende las peticiones de `/api/pago` para listar el estado de cobranza de
 * todas las instalaciones, registrar nuevos cobros (creando sus mensualidades
 * automáticamente), consultar pagos pendientes de corte de caja y exportar a Excel.
 */

/** Obtiene la lista detallada de instalaciones junto con su último pago y días de atraso */
const getAll = async (req,res) => {
    try {
        const pago = await Pago.findAllDetallado(req.db);
        res.json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene un pago específico por su ID */
const getById = async ( req,res ) => {
    try {
        const pago = await Pago.findByPk(req.db,req.params.id);
        if(!pago) return res.status(404).json({ error: 'Pago no encontrado'});
        res.json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Registra un nuevo pago (y sus mensualidades) inyectando el `UsuarioId` y la IP de auditoría */
const create = async (req, res) => {
    try {
        if (!req.body.InstalacionId) {
            return res.status(400).json({ error: 'InstalacionId es requerido para registrar el pago' });
        }
        const payload = {
            ...req.body,
            UsuarioId: req.user?.id || req.body.UsuarioId,
            Direccion_IP: req.body.Direccion_IP || req.ip
        };
        const pago = await Pago.create(req.db, payload);
        res.status(201).json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Obtiene los pagos en efectivo que aún no han sido incluidos en ningún Corte de Caja */
const getPendientesCorte = async (req, res) => {
    try {
        const usuarioId = req.query.usuarioId || req.user?.id || null;
        const pagos = await Pago.findPendientesCorte(req.db, usuarioId);
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza los datos de un pago existente */
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

/** Devuelve el desglose detallado de una lista de IDs de pago (usado en el modal de Corte de Caja) */
const getDesglose = async (req, res) => {
    try {
        const { pagoIds } = req.body;
        const rows = await Pago.findDesgloseByPagoIds(req.db, pagoIds);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Ejecuta el procedimiento almacenado `sp_ProcesarPago` en MariaDB */
const procesarPago = async (req, res) => {
    try {
        const resultado = await Pago.procesarPagoSP(req.db, {
            ...req.body,
            UsuarioId: req.user?.id || req.body.UsuarioId,
            Direccion_IP: req.body.Direccion_IP || req.ip
        });
        if (resultado && resultado.CodigoResultado !== 'EXITO') {
            return res.status(400).json(resultado);
        }
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene todas las instalaciones y sus mensualidades pagadas para construir el archivo Excel */
const getExportar = async (req, res) => {
    try {
        const pagos = await Pago.findAllParaExportar(req.db);
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, getDesglose, procesarPago, getExportar, getPendientesCorte }