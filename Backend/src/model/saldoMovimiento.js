/**
 * ============================================================================
 * MODELO DE BASE DE DATOS: SaldoMovimiento (src/model/saldoMovimiento.js)
 * ============================================================================
 * Gestiona la tabla `Saldo_Movimiento`, que funciona como un estado de cuenta
 * o historial de movimientos del saldo a favor/en contra de un cliente
 * (cargos, abonos o aplicaciones de saldo en pagos).
 * ============================================================================
 */

// Consulta base que une cada movimiento de saldo con el nombre del cliente y el usuario que lo registró
const SELECT_SALDO_MOVIMIENTO = `
    SELECT
        sm.MovimientoSaldoId,
        sm.ClienteId,
        c.Nombre_Cliente,
        sm.PagoId,
        sm.MensualidadId,
        sm.UsuarioId,
        u.Nombre AS Nombre_Usuario,
        sm.Tipo_Movimiento,
        sm.Monto,
        sm.Concepto,
        sm.Fecha
    FROM Saldo_Movimiento sm
    INNER JOIN Cliente c ON sm.ClienteId = c.ClienteId
    LEFT JOIN Usuario u ON sm.UsuarioId = u.UsuarioId
`;

const SaldoMovimiento = {
    /**
     * Obtiene todos los movimientos de saldo ordenados del más reciente al más antiguo.
     */
    findAll: async (db) => {
        return await db.query(`${SELECT_SALDO_MOVIMIENTO} ORDER BY sm.Fecha DESC`);
    },

    /**
     * Busca un movimiento de saldo específico por su ID (`MovimientoSaldoId`).
     */
    findByPk: async (db, id) => {
        const rows = await db.query(`${SELECT_SALDO_MOVIMIENTO} WHERE sm.MovimientoSaldoId = ?`, [id]);
        return rows[0];
    },

    /**
     * Obtiene el historial de movimientos de saldo de un cliente en particular (`ClienteId`).
     */
    findByCliente: async (db, clienteId) => {
        return await db.query(
            `${SELECT_SALDO_MOVIMIENTO} WHERE sm.ClienteId = ? ORDER BY sm.Fecha DESC`,
            [clienteId]
        );
    },

    /**
     * Registra un nuevo movimiento de saldo en la tabla `Saldo_Movimiento`.
     */
    create: async (db, data) => {
        const { ClienteId, PagoId, MensualidadId, UsuarioId, Tipo_Movimiento, Monto, Concepto } = data;
        const result = await db.query(
            `INSERT INTO Saldo_Movimiento (
                ClienteId, PagoId, MensualidadId, UsuarioId, Tipo_Movimiento, Monto, Concepto
             ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                ClienteId,
                PagoId || null,
                MensualidadId || null,
                UsuarioId,
                Tipo_Movimiento,
                Monto,
                Concepto
            ]
        );
        return await SaldoMovimiento.findByPk(db, Number(result.insertId));
    }
};

module.exports = SaldoMovimiento;
