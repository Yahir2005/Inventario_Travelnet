const Cliente =  require('../model/cliente');

/**
 * ============================================================================
 * CONTROLADOR DE CLIENTES (clienteController.js)
 * ============================================================================
 * Recibe las peticiones HTTP de `/api/cliente`, valida los datos básicos,
 * llama a los métodos del modelo `Cliente` pasando la conexión `req.db`
 * y devuelve la respuesta en formato JSON.
 */

/** Obtiene todos los clientes (catálogo general) */
const getAll = async (req,res) => {
    try {
        const cliente = await Cliente.findAll(req.db);
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Busca un cliente específico por su ID (`req.params.id`) */
const getById = async (req,res) => {
    try {
        const cliente = await Cliente.findByPk(req.db,req.params.id);
        if(!cliente) return res.status(404).json({ error: 'Cliente no encontrado'});
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Crea un nuevo cliente tras verificar que `Nombre_Cliente` no venga vacío */
const create = async (req,res) => {
    try {
        if (!req.body.Nombre_Cliente || !String(req.body.Nombre_Cliente).trim()) {
            return res.status(400).json({ error: 'Nombre_Cliente es requerido' });
        }
        const cliente = await Cliente.create(req.db,req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Actualiza los datos o el estado (`Active`) de un cliente existente */
const update = async (req,res) => {
    try {
        const exist = await Cliente.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({ error: 'Cliente no encontrado'});

        const clienteUpdated = await Cliente.update(req.db, req.params.id, req.body);
        res.json(clienteUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Elimina (o desactiva) un cliente por su ID */
const remove = async (req,res) => {
    try {
        const delated = await Cliente.remove(req.db,req.params.id);
        if(!delated) return res.status(404).json({ error: 'Cliente no encontrado'});
        res.json({message: 'Cliente desactivado correctamente'});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

/** Obtiene la lista detallada de clientes junto con el total de sus instalaciones y su última foto */
const getClienteInstallationsList = async (req, res) => {
    try {
        const clientesDetallados = await Cliente.clientInstallationList(req.db);
        res.json(clientesDetallados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove, getClienteInstallationsList};