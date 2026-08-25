const Pago = require('../model/pago');

const getAll = async (req,res) => {
    try {
        const pago = await Pago.findAllDetallado(req.db);
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

const getDesglose = async (req, res) => {
    try {
        const { pagoIds } = req.body;
        if (!pagoIds || !Array.isArray(pagoIds) || pagoIds.length === 0) {
            return res.json([]);
        }
        const placeholders = pagoIds.map(() => '?').join(',');
        const query = `
            SELECT 
                p.PagoId, 
                c.Nombre_Cliente AS Cliente, 
                m.Mes, 
                m.Anio, 
                m.Concepto, 
                pd.Monto_Abonado AS MontoMes,
                p.Descuento
            FROM Pago p
            INNER JOIN Instalacion i ON p.InstalacionId = i.InstalacionId
            INNER JOIN Cliente c ON i.ClienteId = c.ClienteId
            INNER JOIN Pago_Detalle pd ON pd.PagoId = p.PagoId
            INNER JOIN Mensualidad m ON m.MensualidadId = pd.MensualidadId
            WHERE p.PagoId IN (${placeholders})
            ORDER BY p.PagoId, m.Anio, m.Mes
        `;
        const rows = await req.db.query(query, pagoIds);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, getDesglose }