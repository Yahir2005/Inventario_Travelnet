const Usuario = require ('../model/usuario');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * ============================================================================
 * CONTROLADOR DE USUARIOS Y AUTENTICACIÓN (usuarioController.js)
 * ============================================================================
 * Gestiona el CRUD de empleados del sistema y el proceso de inicio de sesión
 * (`login`), generando un token JWT firmado con vigencia de 8 horas.
 */

/** Obtiene todos los usuarios registrados (sin exponer su contraseña) */
const getAll = async ( req,res) => {
    try{
        const usuarios = await Usuario.findAll(req.db);
        res.json(usuarios);
    }catch (error){
        res.status(500).json({ error: error.message});
    }
};

/** Obtiene un usuario específico por su ID */
const getById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.db,req.params.id);
        if(!usuario) return res.status(404).json({ error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Obtiene únicamente los usuarios que tienen `Active = 1` */
const getByActive = async (req, res) => {
    try {
        const usuario = await Usuario.findByActive(req.db);
        if(!usuario) return res.status(404).json({ error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Registra un nuevo usuario (el modelo se encarga de encriptar la contraseña con bcrypt) */
const create = async (req,res) => {
    try {
        const usuario = await Usuario.create(req.db,req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/** Actualiza los datos, rol o estado activo de un usuario existente */
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

/** Desactiva lógicamente (`Active = 0`) a un usuario */
const remove = async (req,res) => {
    try {
        const delated = await Usuario.remove(req.db,req.params.id);
        if(!delated) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json({message: 'Usuario desactivado correctamente'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

/**
 * Valida usuario y contraseña contra la base de datos.
 * Si son correctos, firma un token JWT con el ID y rol del empleado por 8 horas.
 */
const login = async (req,res) => {
    try {
        const usuarioLoged = await Usuario.login(req.db,req.body);
        
        if(!usuarioLoged){
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos'});
        }

        const token = jwt.sign(
            {
                id: usuarioLoged.UsuarioId,
                rolId: usuarioLoged.RolId,
                rol: usuarioLoged.Rol || usuarioLoged.Ocupacion
            },
            jwtConfig.getSecret(),
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