CREATE DATABASE IF NOT EXISTS Travelnet;
USE Travelnet;
-- ==========================================================
-- 1. CATÁLOGOS BASE (3NF)
-- ==========================================================

CREATE TABLE Rol (
    RolId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Rol (Nombre) VALUES ('Administrador'), ('Instalador'), ('Mostrador'),('Cliente');

CREATE TABLE Metodo_Pago (
    MetodoPagoId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Requiere_Cuenta BOOLEAN DEFAULT FALSE
);

INSERT INTO Metodo_Pago (Nombre, Requiere_Cuenta) VALUES 
('Efectivo', FALSE), ('Transferencia', TRUE), ('Cheque', TRUE), 
('Trueque', FALSE), ('Paypal', TRUE), ('MercadoPago', TRUE), ('Pagaré', FALSE);

CREATE TABLE Localidad (
    LocalidadId INT AUTO_INCREMENT PRIMARY KEY,
    NombreLocalidad VARCHAR(60) NOT NULL UNIQUE
);

INSERT INTO Localidad (NombreLocalidad) VALUES
('Tlacotepec de Benito Juárez'), ('San Marcos Tlacoyalco'), ('Santa María la Alta'),
('Santo Nombre'), ('San José Buenavista'), ('Tepazolco'), ('Pericotepec'),
('San Lucas el Viejo'), ('San Martín Esperilla'), ('San Antonio Tlacuitlapan'),
('Tepetlacolco'), ('San José Tlacuitlapan'), ('Guadalupe Victoria'),
('La Colonia Benito Juárez'), ('Tecoxtle'), ('Colonia Jose Huerta'),
('La Columna'), ('Tecalzingo'), ('El Común'), ('Colonia San Pedro'),
('Rancho de Rojas'), ('Palmillas'), ('Colonia Ignacio Zaragoza'),
('Monte de Horno'), ('La Estación'), ('San Jose Valsequillo'),
('Barrio San Lucas'), ('Pazoltepec'), ('Tecamachalco'), ('Quecholac');

CREATE TABLE Motivo_Cancelacion (
    MotivoId INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO Motivo_Cancelacion (Descripcion) VALUES
('Error de captura'),
('Solicitud del cliente'),
('Pago duplicado'),
('Transferencia o cheque rechazado'),
('Otro');

CREATE TABLE Estado_Herramienta (
    EstadoId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Estado_Herramienta (Nombre) VALUES ('Disponible'), ('En reposicion'), ('Perdido'), ('Asignado');

CREATE TABLE Unidad_Medida (
    UnidadId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Abreviatura VARCHAR(10)
);

INSERT INTO Unidad_Medida (Nombre, Abreviatura) VALUES 
('Metros', 'm'), ('Piezas', 'pz'), ('Kilogramos', 'kg'), ('Litros', 'L');

-- ==========================================================
-- 2. PLANES Y TARIFAS
-- ==========================================================

CREATE TABLE Plan (
    PlanId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Velocidad_Mbps INT NOT NULL,
    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Plan_Tarifa (
    TarifaId INT AUTO_INCREMENT PRIMARY KEY,
    PlanId INT NOT NULL,
    Modalidad ENUM(
        'Mensual', 'Bimestral', 'Trimestral', 'Cuatrimestral', 
        'Quinquemestral', 'Semestral', 'Heptamestral', 'Octomestral', 
        'Nonamestral', 'Decamestral', 'Oncemestral', 'Anual'
    ) DEFAULT 'Mensual',
    Precio DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (PlanId) REFERENCES Plan(PlanId),
    UNIQUE KEY uq_plan_modalidad (PlanId, Modalidad)
);

INSERT INTO Plan (Nombre, Velocidad_Mbps) VALUES 
('20 MEGAS', 20), ('40 MEGAS', 40), ('60 MEGAS', 60), 
('80 MEGAS', 80), ('100 MEGAS', 100);

INSERT INTO Plan_Tarifa (PlanId, Modalidad, Precio) VALUES 
(1, 'Mensual', 300.00), (1, 'Anual', 3000.00),
(2, 'Mensual', 500.00), (2, 'Anual', 5000.00),
(3, 'Mensual', 700.00), (3, 'Anual', 7000.00),
(4, 'Mensual', 900.00), (4, 'Anual', 9000.00),
(5, 'Mensual', 1200.00), (5, 'Anual', 12000.00);

-- ==========================================================
-- 3. INFRAESTRUCTURA, USUARIOS Y CLIENTES
-- ==========================================================

CREATE TABLE Infraestructura (
    InfraestructuraId INT AUTO_INCREMENT PRIMARY KEY,
    Tipo ENUM('OLT', 'Torre') NOT NULL,
    Nombre VARCHAR(50) NOT NULL,
    Ubicacion TEXT
);

CREATE TABLE Usuario (
    UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
    RolId INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Usuario VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(60),
    Telefono VARCHAR(13),
    Active BOOLEAN DEFAULT TRUE,
    accesos_count INT DEFAULT 0,
    ultimo_acceso DATETIME DEFAULT NULL,
    FOREIGN KEY (RolId) REFERENCES Rol(RolId)
);

CREATE TABLE Cliente (
    ClienteId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Cliente VARCHAR(100) NOT NULL,
    Telefono VARCHAR(13),
    Calle VARCHAR(100),
    Numero VARCHAR(20),
    Colonia VARCHAR(100),
    Codigo_Postal VARCHAR(10),
    Saldo_Actual DECIMAL(10,2) DEFAULT 0.00,
    Active BOOLEAN DEFAULT TRUE,
    TipoCliente ENUM('Fisica', 'Moral') DEFAULT 'Fisica'
);

-- ==========================================================
-- 4. INSTALACIONES Y SOPORTE
-- ==========================================================

CREATE TABLE Instalacion (
    InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT NOT NULL,
    ClienteId INT NOT NULL,
    TarifaId INT NOT NULL,
    InfraestructuraId INT NOT NULL,
    LocalidadId INT NOT NULL,
    Ubicacion_Maps TEXT,
    Nombre_Wifi VARCHAR(50),
    Password_Wifi VARCHAR(100),
    Active BOOLEAN DEFAULT TRUE,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    Fecha_Instalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TarifaId) REFERENCES Plan_Tarifa(TarifaId),
    FOREIGN KEY (LocalidadId) REFERENCES Localidad(LocalidadId),
    FOREIGN KEY (ClienteId) REFERENCES Cliente(ClienteId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (InfraestructuraId) REFERENCES Infraestructura(InfraestructuraId)
);

CREATE TABLE Imagen_Instalacion (
    Imagen_InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT NOT NULL,
    Ruta_Imagen VARCHAR(255) NOT NULL,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE, 
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId)
);

CREATE TABLE Reporte (
    ReporteId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT NOT NULL,
    UsuarioId INT NOT NULL,
    Fecha_Levantamiento DATE NOT NULL,
    Tipo_Servicio ENUM('Mantenimiento', 'Migracion') NOT NULL,
    Detalles TEXT,
    Active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Servicios (
    ServicioId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT NOT NULL,
    ReporteId INT NOT NULL,
    Observaciones TEXT,
    Estado ENUM('Realizado', 'Pospuesto') NOT NULL,
    Pago DECIMAL(10,2) DEFAULT NULL,
    Fecha_Finalizado DATETIME DEFAULT CURRENT_TIMESTAMP,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (ReporteId) REFERENCES Reporte(ReporteId)
);

CREATE TABLE Desinstalacion (
    DesinstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT NOT NULL, 
    UsuarioId INT NOT NULL,
    Motivo TEXT,
    Fecha_Desinstalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    sincronizado TINYINT(1) DEFAULT 1,    
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Modificaciones (
    LogId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT NOT NULL,
    Tabla_Afectada VARCHAR(50) NOT NULL,
    Registro_Afectado VARCHAR(50) NOT NULL,
    Accion ENUM('Insercion', 'Modificacion', 'Eliminacion') NOT NULL,
    Fecha_Hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Valores_anteriores JSON DEFAULT NULL,
    Valores_nuevos JSON DEFAULT NULL,
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

-- ==========================================================
-- 5. FACTURACIÓN Y SALDOS
-- ==========================================================

CREATE TABLE Mensualidad (
    MensualidadId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT NOT NULL,
    Mes TINYINT NOT NULL CHECK (Mes BETWEEN 1 AND 12),
    Anio SMALLINT NOT NULL CHECK (Anio >= 2020),
    Concepto VARCHAR(100) NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    Active BOOLEAN DEFAULT TRUE,
    Estado ENUM('Pendiente', 'Pagado', 'Vencido', 'Incompleto') DEFAULT 'Pendiente',
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId),
    UNIQUE KEY uq_mensualidad_periodo (InstalacionId, Anio, Mes)
);

CREATE TABLE Pago (
    PagoId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT NOT NULL,
    UsuarioId INT NOT NULL,
    MetodoPagoId INT NOT NULL,
    Fecha_Pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    Numero_cuenta VARCHAR(50) DEFAULT NULL,
    Referencia_Externa VARCHAR(100) DEFAULT NULL,
    Direccion_IP VARCHAR(45) DEFAULT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0.00,
    Estado_Pago ENUM('Completado', 'Pendiente', 'Cancelado') DEFAULT 'Completado',
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1, 
    Ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (MetodoPagoId) REFERENCES Metodo_Pago(MetodoPagoId)
);

CREATE TABLE Pago_Detalle (
    DetalleId INT AUTO_INCREMENT PRIMARY KEY,
    PagoId INT NOT NULL,
    MensualidadId INT NOT NULL,
    Monto_Abonado DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (PagoId) REFERENCES Pago(PagoId),
    FOREIGN KEY (MensualidadId) REFERENCES Mensualidad(MensualidadId),
    UNIQUE KEY uq_pago_mensualidad (PagoId, MensualidadId)
);

CREATE TABLE Saldo_Movimiento (
    MovimientoSaldoId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT NOT NULL,
    PagoId INT DEFAULT NULL,
    MensualidadId INT DEFAULT NULL,
    UsuarioId INT NOT NULL,
    Tipo_Movimiento ENUM('Abono', 'Cargo') NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    Concepto VARCHAR(150) NOT NULL,
    Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ClienteId) REFERENCES Cliente(ClienteId),
    FOREIGN KEY (PagoId) REFERENCES Pago(PagoId),
    FOREIGN KEY (MensualidadId) REFERENCES Mensualidad(MensualidadId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Cancelacion_Pago (
    CancelacionId INT AUTO_INCREMENT PRIMARY KEY,
    PagoId INT NOT NULL UNIQUE,
    UsuarioId INT NOT NULL,
    MotivoId INT NOT NULL,
    Observaciones TEXT,
    Fecha_Cancelacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PagoId) REFERENCES Pago(PagoId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (MotivoId) REFERENCES Motivo_Cancelacion(MotivoId)
);

CREATE TABLE CorteCaja (
    CorteId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT NOT NULL,
    AutorizadorId INT NOT NULL,
    MontoTotal_Declarado DECIMAL(10,2) NOT NULL,
    MontoTotal_Calculado DECIMAL(10,2) NOT NULL,
    FechaCorte DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (AutorizadorId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Corte_Pago (
    CorteId INT NOT NULL,
    PagoId INT NOT NULL,
    PRIMARY KEY (CorteId, PagoId),
    FOREIGN KEY (CorteId) REFERENCES CorteCaja(CorteId),
    FOREIGN KEY (PagoId) REFERENCES Pago(PagoId)
);

-- ==========================================================
-- 6. INVENTARIOS
-- ==========================================================

CREATE TABLE Herramienta (
    HerramientaId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Herramienta VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Codigo VARCHAR(50) UNIQUE,
    EstadoId INT NOT NULL,
    Fecha_Actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EstadoId) REFERENCES Estado_Herramienta(EstadoId)
);

CREATE TABLE Material (
    MaterialId INT AUTO_INCREMENT PRIMARY KEY,
    Tipo ENUM('Fibra', 'Antena', 'Ambos', 'Consumible') NOT NULL,
    Nombre_Material VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Cantidad_Stock DECIMAL(10,2) DEFAULT 0.00,
    UnidadId INT NOT NULL,
    Fecha_Actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UnidadId) REFERENCES Unidad_Medida(UnidadId)
);

CREATE TABLE Movimiento_Material (
    MovimientoId INT AUTO_INCREMENT PRIMARY KEY,
    MaterialId INT NOT NULL,
    UsuarioId INT NOT NULL,
    Tipo_Movimiento ENUM('Entrada', 'Salida', 'Merma') NOT NULL,
    Cantidad DECIMAL(10,2) NOT NULL,
    Fecha_Movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notas TEXT,
    FOREIGN KEY (MaterialId) REFERENCES Material(MaterialId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Asignacion_Herramienta (
    AsignacionId INT AUTO_INCREMENT PRIMARY KEY,
    HerramientaId INT NOT NULL,
    UsuarioId INT NOT NULL,
    Fecha_Asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fecha_Devolucion DATETIME DEFAULT NULL,
    FOREIGN KEY (HerramientaId) REFERENCES Herramienta(HerramientaId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

-- ==========================================================
-- 7. TRIGGER (SINCRONIZACIÓN DE SALDO)
-- ==========================================================

DELIMITER $$

CREATE TRIGGER trg_actualizar_saldo_cliente
AFTER INSERT ON Saldo_Movimiento
FOR EACH ROW
BEGIN
    IF NEW.Tipo_Movimiento = 'Abono' THEN
        UPDATE Cliente 
        SET Saldo_Actual = Saldo_Actual + NEW.Monto 
        WHERE ClienteId = NEW.ClienteId;
    ELSEIF NEW.Tipo_Movimiento = 'Cargo' THEN
        UPDATE Cliente 
        SET Saldo_Actual = Saldo_Actual - NEW.Monto 
        WHERE ClienteId = NEW.ClienteId;
    END IF;
END$$

DELIMITER ;

-- ==========================================================
-- 8. PROCEDIMIENTO ALMACENADO DE PAGO
-- ==========================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_ProcesarPago$$

CREATE PROCEDURE sp_ProcesarPago(
    IN p_InstalacionId INT,
    IN p_UsuarioId INT,
    IN p_MetodoPagoId INT,
    IN p_MensualidadId INT,
    IN p_MontoRecibido DECIMAL(10,2),
    IN p_NumeroCuenta VARCHAR(50),
    IN p_ReferenciaExterna VARCHAR(100),
    IN p_DireccionIP VARCHAR(45),
    IN p_UuidLocal VARCHAR(36),
    IN p_AplicarSaldoFavor BOOLEAN,
    OUT p_CodigoResultado VARCHAR(30),
    OUT p_Mensaje VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_ClienteId INT DEFAULT NULL;
    DECLARE v_MontoMensualidad DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_EstadoMensualidad VARCHAR(20);
    DECLARE v_AbonosPagoDetalle DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_AbonosSaldoPrevio DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_TotalAbonadoPrevio DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_SaldoCliente DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_DeudaPendiente DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_DescuentoSaldo DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_AbonoDirecto DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_Excedente DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_NuevoPagoId INT DEFAULT NULL;
    DECLARE v_TotalCubierto DECIMAL(10,2) DEFAULT 0.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_CodigoResultado = 'ERROR_SQL';
        SET p_Mensaje = 'Ocurrió un error inesperado al procesar la transacción en la base de datos.';
    END;

    IF p_UuidLocal IS NOT NULL AND EXISTS (SELECT 1 FROM Pago WHERE Uuid_local = p_UuidLocal) THEN
        SET p_CodigoResultado = 'UUID_DUPLICADO';
        SET p_Mensaje = 'Este pago ya fue procesado con anterioridad (UUID duplicado).';
        LEAVE proc_label;
    END IF;

    IF p_MontoRecibido > 0.00 AND NOT EXISTS (SELECT 1 FROM Metodo_Pago WHERE MetodoPagoId = p_MetodoPagoId) THEN
        SET p_CodigoResultado = 'METODO_PAGO_INVALIDO';
        SET p_Mensaje = 'El método de pago especificado no existe en el catálogo.';
        LEAVE proc_label;
    END IF;

    START TRANSACTION;

    SELECT Monto, Estado 
    INTO v_MontoMensualidad, v_EstadoMensualidad
    FROM Mensualidad
    WHERE MensualidadId = p_MensualidadId 
      AND InstalacionId = p_InstalacionId
    FOR UPDATE;

    IF v_MontoMensualidad IS NULL THEN
        ROLLBACK;
        SET p_CodigoResultado = 'MENSUALIDAD_NO_EXISTE';
        SET p_Mensaje = 'La mensualidad no existe o no corresponde a la instalación indicada.';
        LEAVE proc_label;
    END IF;

    IF v_EstadoMensualidad = 'Pagado' THEN
        ROLLBACK;
        SET p_CodigoResultado = 'YA_PAGADA';
        SET p_Mensaje = 'La mensualidad ya se encuentra completamente liquidada.';
        LEAVE proc_label;
    END IF;

    SELECT c.ClienteId, c.Saldo_Actual
    INTO v_ClienteId, v_SaldoCliente
    FROM Cliente c
    INNER JOIN Instalacion i ON c.ClienteId = i.ClienteId
    WHERE i.InstalacionId = p_InstalacionId
    FOR UPDATE;

    IF v_ClienteId IS NULL THEN
        ROLLBACK;
        SET p_CodigoResultado = 'CLIENTE_NO_ENCONTRADO';
        SET p_Mensaje = 'No se encontró el cliente asociado a la instalación.';
        LEAVE proc_label;
    END IF;

    IF (p_MontoRecibido IS NULL OR p_MontoRecibido <= 0.00) AND (p_AplicarSaldoFavor = FALSE OR v_SaldoCliente <= 0.00) THEN
        ROLLBACK;
        SET p_CodigoResultado = 'SIN_FONDOS';
        SET p_Mensaje = 'Debe ingresar un monto a pagar o contar con saldo a favor suficiente para aplicar.';
        LEAVE proc_label;
    END IF;

    SELECT COALESCE(SUM(Monto_Abonado), 0.00)
    INTO v_AbonosPagoDetalle
    FROM Pago_Detalle
    WHERE MensualidadId = p_MensualidadId;

    SELECT COALESCE(SUM(Monto), 0.00)
    INTO v_AbonosSaldoPrevio
    FROM Saldo_Movimiento
    WHERE MensualidadId = p_MensualidadId 
      AND Tipo_Movimiento = 'Cargo';

    SET v_TotalAbonadoPrevio = v_AbonosPagoDetalle + v_AbonosSaldoPrevio;
    SET v_DeudaPendiente = v_MontoMensualidad - v_TotalAbonadoPrevio;

    IF p_AplicarSaldoFavor = TRUE AND v_SaldoCliente > 0.00 THEN
        IF v_SaldoCliente >= v_DeudaPendiente THEN
            SET v_DescuentoSaldo = v_DeudaPendiente;
        ELSE
            SET v_DescuentoSaldo = v_SaldoCliente;
        END IF;

        SET v_DeudaPendiente = v_DeudaPendiente - v_DescuentoSaldo;

        INSERT INTO Saldo_Movimiento (
            ClienteId, PagoId, MensualidadId, UsuarioId, Tipo_Movimiento, Monto, Concepto
        ) VALUES (
            v_ClienteId, NULL, p_MensualidadId, p_UsuarioId, 'Cargo', v_DescuentoSaldo,
            CONCAT('Aplicación de saldo a favor a Mensualidad #', p_MensualidadId)
        );
    END IF;

    IF p_MontoRecibido > 0.00 THEN
        INSERT INTO Pago (
            InstalacionId, UsuarioId, MetodoPagoId, Numero_cuenta,
            Referencia_Externa, Direccion_IP, Uuid_local
        ) VALUES (
            p_InstalacionId, p_UsuarioId, p_MetodoPagoId, p_NumeroCuenta,
            p_ReferenciaExterna, p_DireccionIP, p_UuidLocal
        );

        SET v_NuevoPagoId = LAST_INSERT_ID();

        IF p_MontoRecibido >= v_DeudaPendiente THEN
            SET v_AbonoDirecto = v_DeudaPendiente;
            SET v_Excedente = p_MontoRecibido - v_DeudaPendiente;
        ELSE
            SET v_AbonoDirecto = p_MontoRecibido;
            SET v_Excedente = 0.00;
        END IF;

        IF v_AbonoDirecto > 0.00 THEN
            INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado)
            VALUES (v_NuevoPagoId, p_MensualidadId, v_AbonoDirecto);
        END IF;

        IF v_Excedente > 0.00 THEN
            INSERT INTO Saldo_Movimiento (
                ClienteId, PagoId, MensualidadId, UsuarioId, Tipo_Movimiento, Monto, Concepto
            ) VALUES (
                v_ClienteId, v_NuevoPagoId, NULL, p_UsuarioId, 'Abono', v_Excedente,
                CONCAT('Excedente originado en Pago #', v_NuevoPagoId)
            );
        END IF;
    END IF;

    SET v_TotalCubierto = v_TotalAbonadoPrevio + v_DescuentoSaldo + v_AbonoDirecto;

    IF v_TotalCubierto >= v_MontoMensualidad THEN
        UPDATE Mensualidad
        SET Estado = 'Pagado'
        WHERE MensualidadId = p_MensualidadId;
    ELSEIF v_TotalCubierto > 0.00 THEN
        UPDATE Mensualidad
        SET Estado = 'Incompleto'
        WHERE MensualidadId = p_MensualidadId;
    END IF;

    COMMIT;

    SET p_CodigoResultado = 'EXITO';
    SET p_Mensaje = CONCAT('Pago procesado correctamente. Total cubierto: $', v_TotalCubierto, 
                           ' de $', v_MontoMensualidad, 
                           IF(v_Excedente > 0, CONCAT(' (Excedente abonado al saldo: $', v_Excedente, ')'), ''));

END proc_label$$

DELIMITER ;