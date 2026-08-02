const Usuario = require ('../model/usuario');
const jwt = require('jsonwebtoken');

const getAll = async ( req,res) => {
    try{
        const usuarios = await Usuario.findAll(req.db);
        res.json(usuarios);
    }catch (error){
        res.status(500).json({ error: error.message});
    }
};

const getById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.db,req.params.id);
        if(!usuario) return res.status(404).json({ error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getByActive = async (req, res) => {
    try {
        const usuario = await Usuario.findByActive(req.db);
        if(!usuario) return res.status(404).json({ error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const create = async (req,res) => {
    try {
        const usuario = await Usuario.create(req.db,req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const update = async (req,res) => {
    try {
        const exist = await Usuario.findByPk(req.db,req.params.id);
        if(!exist) return res.status(404).json({error: 'Usuario no encontrado'});

        const usuarioUpdated = await Usuario.update(req.db, req.params.id, req.body);
        res.json(usuarioUpdated);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const remove = async (req,res) => {
    try {
        const delated = await Usuario.remove(req.db,req.params.id);
        if(!delated) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json({message: 'Usuario desactivado correctamente'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const login = async (req,res) => {
    try {
        const usuarioLoged = await Usuario.login(req.db,req.body);
        
        if(!usuarioLoged){
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos'});
        }

        const token = jwt.sign(
            {
                id: usuarioLoged.UsuarioId,
                rol: usuarioLoged.Ocupacion
            },
            'TU CLAVE SECRETA AQUÍ',
            {
                expiresIn: '8h'
            }
        );

        res.json({
            message: 'Login exitoso',
            token: token,
            user: usuarioLoged
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

module.exports = { getAll, getById, getByActive,create,update,remove,login};