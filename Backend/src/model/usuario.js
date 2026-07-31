const db = require('../config/database');

const Usuario = {
    findAll: async(db) => {
        const rows =await db.query('SELECT * FROM Usuario');
        return rows;
    },

    findByPk: async (db,id) => {
        const rows = await db.query('SELECT * FROM Usuario WHERE UsuarioId = ?',[id]);
        return rows[0];
    },
    
    findByActive: async(db,Active) => {
        const rows = await db.query('SELECT * FROM Usuario WHERE Active = TRUE')
        return rows[0];
    },
    
    create: async (db,data) => {
        const {Nombre, Usuario, Password,Email,Telefono,Active,Ocupacion} = data;
        const result = await db.query(
            'INSERT INTO Usuario (Nombre, Usuario, Password,Email,Telefono,Active,Ocupacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [Nombre,Usuario,Password,Email,Telefono,Active]
        );
        return { UsuarioId: result.insertId, ...data,Active:true};
    },

    update: async(db,id,data) => {
        const {Nombre,Usuario,Password,Email,Telefono} = data;
        await db.query(
            'UPDATE Usuario SET Nombre = ?, Usuario = ?, Password = ?, Email = ?, Telefono = ? WHERE UsuarioId = ?',
            [Nombre, Usuario, Password, Email, Telefono, id]
        );
        return {UsuarioId: id, ...data};
    },

    remove: async (db,id) => {
        const result = await db.query('UPDATE Usuario SET Active = FALSE WHERE UsuarioId = ?', [id]);
        return result.affectedRows > 0;
    },

    login: async (db,credentials) => {
        const {Usuario,Password} = credentials;

        const rows = await db.query(
            'SELECT UsuarioId, Nombre, Usuario, Email, Ocupacion FROM Usuario WHERE Usuario = ? AND Password = ? AND Active = TRUE',
            [Usuario,Password]
        );

        if(rows.length === 0){
            return null;
        }

        return rows[0];
    }
}

module.exports = Usuario;