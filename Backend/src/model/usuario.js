const db = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const sanitize = (row) => {
    if (!row) return row;
    const { Password, ...safe } = row;
    return safe;
};

const Usuario = {
    findAll: async(db) => {
        const rows =await db.query('SELECT * FROM Usuario');
        return rows.map(sanitize);
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Usuario WHERE UsuarioId = ?',[id]);
        return sanitize(rows[0]);
    },
    
    findByActive: async(db,Active) => {
        const rows = await db.query('SELECT * FROM Usuario WHERE Active = TRUE')
        return sanitize(rows[0]);
    },
    
    create: async (db,data) => {
        const {Nombre, Usuario, Password,Email,Telefono,Ocupacion} = data;
        const passwordHash = bcrypt.hashSync(Password, SALT_ROUNDS);
        const result = await db.query(
            'INSERT INTO Usuario (Nombre, Usuario, Password,Email,Telefono,Ocupacion) VALUES (?, ?, ?, ?, ?, ?)',
            [Nombre,Usuario,passwordHash,Email,Telefono,Ocupacion]
        );
        return sanitize({ UsuarioId: result.insertId, ...data,Active:true });
    },

    update: async(db,id,data) => {
        const camposEditables = ['Nombre','Usuario','Email','Telefono','Ocupacion'];
        const sets = [];
        const params = [];

        for (const campo of camposEditables) {
            if (data[campo] !== undefined) {
                sets.push(`${campo} = ?`);
                params.push(data[campo]);
            }
        }

        if (data.Active !== undefined) {
            sets.push('Active = ?');
            params.push(data.Active ? 1 : 0);
        }

        if (data.Password) {
            sets.push('Password = ?');
            params.push(bcrypt.hashSync(data.Password, SALT_ROUNDS));
        }

        if (sets.length === 0) {
            return sanitize({UsuarioId: Number(id), ...data});
        }

        params.push(id);
        await db.query(
            `UPDATE Usuario SET ${sets.join(', ')} WHERE UsuarioId = ?`,
            params
        );
        return sanitize({UsuarioId: id, ...data});
    },

    remove: async (db,id) => {
        const result = await db.query('UPDATE Usuario SET Active = FALSE WHERE UsuarioId = ?', [id]);
        return result.affectedRows > 0;
    },

    login: async (db,credentials) => {
        const {Usuario,Password} = credentials;

        const rows = await db.query(
            'SELECT UsuarioId, Nombre, Usuario, Email, Ocupacion, Password FROM Usuario WHERE Usuario = ? AND Active = TRUE',
            [Usuario]
        );

        if(rows.length === 0){
            return null;
        }

        const user = rows[0];

        if(!bcrypt.compareSync(Password || '', user.Password)){
            return null;
        }

        return sanitize(user);
    }
}

module.exports = Usuario;