CREATE DATABASE IF NOT EXISTS Travelnet;
USE Travelnet;

CREATE TABLE Usuario(
    UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Usuario VARCHAR(50),
    Password VARCHAR(50),
    Email VARCHAR(60),
    Telefono VARCHAR(13),
    Activo BOOLEAN DEFAULT TRUE,
    accesos_count INT DEFAULT 0,
    ultimo_acceso DATETIME DEFAULT NULL,
    Ocupacion ENUM('Administrador','Instalador','Mostrador')
);

CREATE TABLE Clientes(
    ClienteId INT AUTO_INCREMENT PRIMARY KEY,
    Telefono VARCHAR(13),
    Nombre_Cliente VARCHAR(50),
    Ubicacion TEXT,
    Fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    Saldo_Pendiente DECIMAL(10,2) DEFAULT 0.00 
);

CREATE TABLE Tipo_Instalacion(
    Tipo_InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    Tipo ENUM('Fibra','Antena'), 
    Torre_Asignada_o_OLT VARCHAR(30)
);

CREATE TABLE Instalacion(
    InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    Tipo_InstalacionId INT,
    ClienteId INT,
    UsuarioId INT,
    Ubicacion_Maps TEXT,
    Fechar_Instalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Nombre_Wifi VARCHAR(50),
    Password_Wifi VARCHAR(100),
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (Tipo_InstalacionId) REFERENCES Tipo_Instalacion(Tipo_InstalacionId), 
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId) 
);

CREATE TABLE Imagen_Instalacion(
    Imagen_InstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    InstalacionId INT,
    Ruta_Imagen VARCHAR(255),
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE, 
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId)
);

CREATE TABLE Servicios(
    ServicioId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    InstalacionId INT,
    UsuarioId INT,
    Tipo_Servicio ENUM('Mantenimiento','Migracion','Otro'),
    Detalle_Otro TEXT,
    Fecha_Servicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId),
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Pago(
    PagoId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    UsuarioId INT,
    Modalidad_Servicio ENUM('Mensual','Bimestral','Trimestral','Anual','Otro'),
    Otro_Modalidad TEXT,
    Fecha_Pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    Tipo_Pago ENUM('Efectivo','Transferencia','Otro'),
    Otro_Pago TEXT,
    Numero_cuenta VARCHAR(50),
    Estado_Pago ENUM('Completado', 'Incompleto', 'Pendiente') DEFAULT 'Completado', 
    Monto DECIMAL(10,2) NOT NULL, 
    Uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    Sincronizado TINYINT(1) DEFAULT 1, 
    Ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Desinstalacion(
    DesinstalacionId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    InstalacionId INT, 
    UsuarioId INT,
    Motivo TEXT,
    Fecha_Desinstalacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    uuid_local VARCHAR(36) DEFAULT NULL UNIQUE,
    sincronizado TINYINT(1) DEFAULT 1,    
    FOREIGN KEY (InstalacionId) REFERENCES Instalacion(InstalacionId), 
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId), 
    FOREIGN KEY (UsuarioId) REFERENCES Usuario(UsuarioId)
);

CREATE TABLE Modificaciones(
    LogId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT, 
    Tabla_Afectada VARCHAR(50),
    Registro_Afectado VARCHAR(50),
    Accion ENUM('Insercion','Modificacion','Eliminacion'),
    Fecha_Hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Valores_anteriores JSON DEFAULT NULL,
    Valores_nuevos JSON DEFAULT NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId) 
);