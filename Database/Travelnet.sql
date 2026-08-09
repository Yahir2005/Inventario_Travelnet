CREATE DATABASE IF NOT EXISTS Travelnet;
USE Travelnet;

CREATE TABLE Usuario(
    UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Usuario VARCHAR(50),
    Password VARCHAR(100),
    Email VARCHAR(60),
    Telefono VARCHAR(13),
    Active BOOLEAN DEFAULT TRUE,
    accesos_count INT DEFAULT 0,
    ultimo_acceso DATETIME DEFAULT NULL,
    Ocupacion ENUM('Administrador','Instalador','Mostrador')
);

CREATE TABLE OLT (
    OLTId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Ubicacion TEXT
);

CREATE TABLE Torre (
    TorreId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Ubicacion TEXT
);

CREATE TABLE Cliente(
    ClienteId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Cliente VARCHAR(50),
    Telefono VARCHAR(13),
    Direccion TEXT,
    Active BOOLEAN DEFAULT TRUE,
    TipoCliente ENUM("Fisica","Moral")
);

CREATE TABLE Localidad(
    LocalidadId INT AUTO_INCREMENT PRIMARY KEY,
    NombreLocalidad VARCHAR(60)
);

INSERT INTO Localidad (NombreLocalidad) VALUES
('Tlacotepec de Benito Juárez'),
('San Marcos Tlacoyalco'),
('Santa María la Alta'),
('Santo Nombre'),
('San José Buenavista'),
('Tepazolco'),
('Pericotepec'),
('San Lucas el Viejo'),
('San Martín Esperilla'),
('San Antonio Tlacuitlapan'),
('Tepetlacolco'),
('San José Tlacuitlapan'),
('Guadalupe Victoria'),
('La Colonia Benito Juárez'),
('Tecoxtle'),
('Colonia Jose Huerta'),
('La Columna'),
('Tecalzingo'),
('El Común'),
('Colonia San Pedro'),
('Rancho de Rojas'),
('Palmillas'),
('Colonia Ignacio Zaragoza'),
('Monte de Horno'),
('La Estación'),
('San Jose Valsequillo'),
('Barrio San Lucas'),
('Pazoltepec'),
('Tecamachalco'),
('Quecholac');

CREATE TABLE Instalacion(
    InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    ClienteId INT,
    OLTId INT DEFAULT NULL,
    TorreId INT DEFAULT NULL,
    LocalidadId INT,
    Ubicacion_Maps TEXT,
    Nombre_Wifi VARCHAR(50),
    Password_Wifi VARCHAR(100),
    Active BOOLEAN DEFAULT TRUE,
    Tipo ENUM('Fibra','Antena'),
    Plan ENUM("20 MEGAS","40 MEGAS","60 MEGAS", "80 MEGAS","100 MEGAS"),
    Modalidad_Servicio ENUM('Mensual','Bimestral','Trimestral','Cuatrimestral','Quinquemestral','Semestral','Heptamestral','Octomestral','Nonamestral','Decamestral','Oncemestral','Anual') DEFAULT 'Mensual',
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    Fecha_Instalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LocalidadId) REFERENCES Localidad(LocalidadId),
    FOREIGN KEY (ClienteId) REFERENCES Cliente(ClienteId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (OLTId) REFERENCES OLT(OLTId),
    FOREIGN KEY (TorreId) REFERENCES Torre(TorreId),
    CHECK (
        (Tipo = 'Fibra' AND OLTId IS NOT NULL AND TorreId IS NULL) OR
        (Tipo = 'Antena' AND TorreId IS NOT NULL AND OLTId IS NULL)
    )  
);

CREATE TABLE Imagen_Instalacion(
    Imagen_InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT,
    Ruta_Imagen VARCHAR(255),
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE, 
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId)
);

CREATE TABLE Reporte(
    ReporteId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    InstalacionId INT,
    Fecha_Levantamiento DATE,
    Tipo_Servicio ENUM('Mantenimiento','Migracion'),
    Detalles TEXT,
    Active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Servicios(
    ServicioId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    ReporteId INT,
    Observaciones TEXT,
    Estado ENUM("Realizado","Pospuesto"),
    Pago DECIMAL(10,2) DEFAULT NULL,
    Fecha_Finalizado DATETIME DEFAULT CURRENT_TIMESTAMP,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId),
    FOREIGN KEY (ReporteId) REFERENCES Reporte(ReporteId)
);

CREATE TABLE Mensualidad (
    MensualidadId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT,
    Mes INT,
    Anio INT,
    Concepto VARCHAR (100),
    Monto DECIMAL(10,2),
    Estado  ENUM('Pendiente','Pagado','Vencido'),
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId)
);

CREATE TABLE Pago(
    PagoId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT,
    UsuarioId INT,
    Fecha_Pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    Tipo_Pago ENUM('Efectivo','Transferencia','Cheque','Trueque','Paypal','MercadoPago','Pagaré'),
    Numero_cuenta VARCHAR(50) DEFAULT 'Efectivo',
    Descuento DECIMAL(10,2),
    Estado_Pago ENUM('Completado', 'Incompleto', 'Pendiente') DEFAULT 'Completado', 
    Monto DECIMAL(10,2) NOT NULL,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1, 
    Ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Pago_Detalle (
    DetalleId INT AUTO_INCREMENT PRIMARY KEY,
    PagoId INT,
    MensualidadId INT,
    Monto_Abonado DECIMAL(10,2),
    FOREIGN KEY (PagoId) REFERENCES Pago(PagoId),
    FOREIGN KEY (MensualidadId) REFERENCES Mensualidad(MensualidadId)
);

CREATE TABLE Desinstalacion(
    DesinstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT, 
    UsuarioId INT,
    Motivo TEXT,
    Fecha_Desinstalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    sincronizado TINYINT(1) DEFAULT 1,    
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Modificaciones(
    LogId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT,
    Tabla_Afectada VARCHAR(50),
    Registro_Afectado VARCHAR(50),
    Accion ENUM('Insercion','Modificacion','Eliminacion'),
    Fecha_Hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Valores_anteriores JSON DEFAULT NULL,
    Valores_nuevos JSON DEFAULT NULL,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId) 
);

CREATE TABLE Herramienta(
    HerramientaId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Herramienta VARCHAR(50),
    Descripcion TEXT,
    Codigo VARCHAR(50),
    Estado ENUM("Perdido","Disponible","En reposicion"),
    Fecha_Actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Material(
    MaterialId INT AUTO_INCREMENT PRIMARY KEY,
    Tipo ENUM("Fibra","Antena","Ambos"),
    Descripcion TEXT,
    Cantidad DECIMAL(10,2),
    Unidad_Medida ENUM('Metros', 'Piezas', 'Kilogramos', 'Litros'),
    Fecha_Actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Inventario(
    HerramientaId INT,
    MaterialId INT,
    FOREIGN KEY (HerramientaId) REFERENCES Herramienta(HerramientaId),
    FOREIGN KEY (MaterialId) REFERENCES Material(MaterialId)
);