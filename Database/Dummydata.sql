USE Travelnet;

-- =========================
-- USUARIOS
-- =========================
INSERT INTO Usuario (Nombre, Usuario, Password, Email, Telefono, Ocupacion) VALUES
('Luis Hernandez', 'lhernandez', '123456', 'luis@travelnet.com', '2221000001', 'Administrador'),
('Ana Martinez', 'amartinez', '123456', 'ana@travelnet.com', '2221000002', 'Instalador'),
('Carlos Perez', 'cperez', '123456', 'carlos@travelnet.com', '2221000003', 'Instalador'),
('Mariana Lopez', 'mlopez', '123456', 'mariana@travelnet.com', '2221000004', 'Mostrador'),
('Jorge Ramirez', 'jramirez', '123456', 'jorge@travelnet.com', '2221000005', 'Instalador');

-- =========================
-- OLT
-- =========================
INSERT INTO OLT (Nombre, Ubicacion) VALUES
('OLT Centro', 'Centro, Puebla'),
('OLT Norte', 'Zona Norte, Puebla'),
('OLT Sur', 'Zona Sur, Puebla');

-- =========================
-- TORRES
-- =========================
INSERT INTO Torre (Nombre, Ubicacion) VALUES
('Torre San Marcos', 'San Marcos Tlacoyalco'),
('Torre Tecamachalco', 'Tecamachalco'),
('Torre Quecholac', 'Quecholac');

-- =========================
-- CLIENTES
-- =========================
INSERT INTO Cliente (Nombre_Cliente, Telefono, Direccion, TipoCliente) VALUES
('Juan Gomez', '2223000001', 'Calle Hidalgo 12', 'Fisica'),
('Maria Torres', '2223000002', 'Av. Reforma 45', 'Fisica'),
('Constructora Delta SA', '2223000003', 'Parque Industrial 5', 'Moral'),
('Pedro Morales', '2223000004', 'Calle Juarez 89', 'Fisica'),
('Escuela Benito Juarez', '2223000005', 'Centro Escolar', 'Moral');

-- =========================
-- INSTALACIONES
-- =========================
INSERT INTO Instalacion
(UsuarioId, ClienteId, OLTId, TorreId, Ubicacion_Maps, Nombre_Wifi, Password_Wifi, Tipo, Localidad, Uuid_local)
VALUES
(2,1,1,NULL,'18.8501,-97.7201','CasaJuan','wifi12345','Fibra','San Marcos Tlacoyalco','11111111-1111-1111-1111-111111111111'),
(3,2,NULL,1,'18.8520,-97.7225','MariaNet','maria2026','Antena','San Marcos Tlacoyalco','22222222-2222-2222-2222-222222222222'),
(2,3,2,NULL,'18.8600,-97.7100','DeltaCorp','deltawifi','Fibra','Tecamachalco','33333333-3333-3333-3333-333333333333'),
(5,4,NULL,2,'18.8700,-97.7000','PedroHome','pedrowifi','Antena','Tecamachalco','44444444-4444-4444-4444-444444444444'),
(3,5,3,NULL,'18.8800,-97.6900','EscuelaBJ','escuela2026','Fibra','Quecholac','55555555-5555-5555-5555-555555555555');

-- =========================
-- IMAGENES DE INSTALACION
-- =========================
INSERT INTO Imagen_Instalacion (InstalacionId, Ruta_Imagen, Uuid_local) VALUES
(1,'/imagenes/inst1_1.jpg','aaaa1111-1111-1111-1111-111111111111'),
(1,'/imagenes/inst1_2.jpg','aaaa2222-2222-2222-2222-222222222222'),
(2,'/imagenes/inst2_1.jpg','bbbb1111-1111-1111-1111-111111111111'),
(3,'/imagenes/inst3_1.jpg','cccc1111-1111-1111-1111-111111111111'),
(5,'/imagenes/inst5_1.jpg','dddd1111-1111-1111-1111-111111111111');

-- =========================
-- REPORTES
-- =========================
INSERT INTO Reporte
(InstalacionId, UsuarioId, Fecha_Levantamiento, Tipo_Servicio, Detalles)
VALUES
(1,2,'2026-07-10','Mantenimiento','Cambio de conector y limpieza de caja'),
(2,3,'2026-07-12','Migracion','Migracion a nueva torre'),
(4,5,'2026-07-15','Mantenimiento','Reorientacion de antena');

-- =========================
-- SERVICIOS
-- =========================
INSERT INTO Servicios
(UsuarioId, ReporteId, Observaciones, Estado, Pago, Uuid_local)
VALUES
(2,1,'Servicio realizado sin inconvenientes','Realizado',350.00,'srv-1111-1111-1111-111111111111'),
(3,2,'Cliente solicito cambio de equipo','Realizado',500.00,'srv-2222-2222-2222-222222222222'),
(5,3,'Pendiente por lluvia','Pospuesto',NULL,'srv-3333-3333-3333-333333333333');

-- =========================
-- PAGOS
-- =========================
INSERT INTO Pago
(InstalacionId, UsuarioId, Modalidad_Servicio, Fecha_Pago, Tipo_Pago, Estado_Pago, Monto, Plan, Uuid_local)
VALUES
(1,4,'Mensual','2026-07-01 10:30:00','Efectivo','Completado',350.00,'40 MEGAS','pay-1111-1111-1111-111111111111'),
(2,4,'Mensual','2026-07-05 12:10:00','Transferencia','Completado',450.00,'60 MEGAS','pay-2222-2222-2222-222222222222'),
(3,4,'Bimestral','2026-07-08 09:15:00','Transferencia','Pendiente',1400.00,'100 MEGAS','pay-3333-3333-3333-333333333333'),
(4,4,'Mensual','2026-07-15 16:40:00','Efectivo','Incompleto',200.00,'20 MEGAS','pay-4444-4444-4444-444444444444'),
(5,4,'Anual','2026-07-20 11:00:00','Transferencia','Completado',4800.00,'80 MEGAS','pay-5555-5555-5555-555555555555');

-- =========================
-- DESINSTALACIONES
-- =========================
INSERT INTO Desinstalacion
(InstalacionId, UsuarioId, Motivo, Fecha_Desinstalacion, uuid_local)
VALUES
(4,5,'Cambio de proveedor','2026-07-25 14:00:00','des-1111-1111-1111-111111111111');

-- =========================
-- MODIFICACIONES
-- =========================
INSERT INTO Modificaciones
(InstalacionId, Tabla_Afectada, Registro_Afectado, Accion, Valores_anteriores, Valores_nuevos)
VALUES
(2,'Instalacion','2','Modificacion',
 JSON_OBJECT('Nombre_Wifi','MariaNet'),
 JSON_OBJECT('Nombre_Wifi','MariaNet_5G')),
(1,'Pago','1','Modificacion',
 JSON_OBJECT('Estado_Pago','Pendiente'),
 JSON_OBJECT('Estado_Pago','Completado'));

-- =========================
-- HERRAMIENTAS
-- =========================
INSERT INTO Herramienta
(Nombre_Herramienta, Descripcion, Codigo, Estado)
VALUES
('Fusionadora','Fusionadora de fibra optica','H001','Disponible'),
('Escalera','Escalera telescopica 6m','H002','Disponible'),
('Taladro','Taladro percutor industrial','H003','En reposicion'),
('Medidor OTDR','Equipo de medicion OTDR','H004','Disponible'),
('Pinza Ponchadora','Pinza para conectores RJ45','H005','Perdido');

-- =========================
-- MATERIALES
-- =========================
INSERT INTO Material
(Tipo, Descripcion, Cantidad, Unidad_Medida)
VALUES
('Fibra','Cable de fibra monomodo',1200,'Metros'),
('Fibra','Conectores SC/APC',250,'Piezas'),
('Antena','Cable UTP exterior',800,'Metros'),
('Antena','Antena CPE 5 GHz',40,'Piezas'),
('Ambos','Cinchos de nylon',1000,'Piezas');
