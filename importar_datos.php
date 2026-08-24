<?php
// 1. Configuración de Conexión a MariaDB local
$host = '127.0.0.1';
$db   = 'Travelnet';
$user = 'mysql_admin';
$pass = '2VVW/ny586Va9IYw77yzpw==';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Abrir archivo para IPs
$ipFile = fopen('ips_clientes.sql', 'w');
fwrite($ipFile, "CREATE TABLE IF NOT EXISTS IPs_Respaldo (Nombre_Cliente VARCHAR(255), Telefono VARCHAR(50), IP VARCHAR(50));\n");

// 2. Obtención dinámica de IDs por defecto
$stmtOlt = $pdo->query("SELECT OLTId FROM OLT WHERE Nombre = 'OLT MIGRACION' LIMIT 1");
$defaultOltId = $stmtOlt->fetchColumn() ?: null;

$stmtTorre = $pdo->query("SELECT TorreId FROM Torre WHERE Nombre = 'TORRE MIGRACION' LIMIT 1");
$defaultTorreId = $stmtTorre->fetchColumn() ?: null;

$stmtUser = $pdo->query("SELECT UsuarioId FROM Usuario LIMIT 1");
$defaultUsuarioId = $stmtUser->fetchColumn() ?: 1;

// 3. Diccionario de Mapeo de Localidades (Palabras clave del Excel -> ID de BD)
function mapearLocalidad($ubicacion_csv) {
    $ubicacion_csv = strtoupper(trim($ubicacion_csv));
    
    $mapa = [
        'B. SAN LUCAS' => 27, 
        'SAN LUCAS' => 27,
        'SN L EL VIEJO' => 8, 
        'SAN MARCOS' => 2,
        'STA. MARIA' => 3, 
        'STO.NOMBRE' => 4, 
        'STO. NOMBRE' => 4,
        'SAN JOSE' => 5, 
        'TEPAZOLCO' => 6,
        'PERICOTEPEC' => 7,
        'SAN MARTIN' => 9, 
        'SAN ANTONIO TLACUITLAPAN' => 10,
        'TEPETLACOLCO' => 11,
        'TLACUITLAPAN' => 12, 
        'GPE. VICTORIA' => 13, 
        'COL. BENITO JUAREZ' => 14, 
        'TECOXTILE' => 15,
        'COL. JOSE HUERTA' => 16,
        'COL JOSE HUERTA' => 16,
        'LA COLUMNA' => 17,
        'TECALZINGO' => 18,
        'EL COMUN' => 19,
        'COL. SAN PEDRO' => 20,
        'RCHO DE ROJAS' => 21, 
        'PALMILLAS' => 22,
        'ZARAGOZA' => 23, 
        'MONTE DE HORNO' => 24,
        'LA ESTACION' => 25,
        'VALSEQUILLO' => 26,
        'PAZOLTEPEC' => 28,
        'TECAMACHALCO' => 29,
        'QUECHOLAC' => 30
    ];

    foreach ($mapa as $clave => $id) {
        if (strpos($ubicacion_csv, $clave) !== false) {
            return $id;
        }
    }
    return 1; 
}


// 4. Procesamiento del Archivo CSV
$archivoCsv = "clientes.csv";

if (($handle = fopen($archivoCsv, "r")) !== FALSE) {
    fgetcsv($handle, 10000, ","); // Saltar cabeceras de años
    fgetcsv($handle, 10000, ","); // Saltar cabeceras de columnas

    $registrosExitosos = 0;
    $errores = 0;

    echo "Iniciando migración de datos...\n<br>";

    while (($data = fgetcsv($handle, 10000, ",")) !== FALSE) {
        
       $nombre_cliente = trim($data[2] ?? '');
        
        if (empty($nombre_cliente)) continue; 

        try {
            $pdo->beginTransaction(); 

            // --- 1. LIMPIEZA DE TELÉFONO (Con soporte para 2 números) ---
            $telefono_raw = trim($data[1] ?? '');
            $telefono = preg_replace('/[^0-9]/', '', $telefono_raw);
            $ubicacion_original = trim($data[3] ?? '');
            
            if (strlen($telefono) > 13) {
                $telefono_extra = substr($telefono, 10); 
                $telefono = substr($telefono, 0, 10);    
                $ubicacion_original = $ubicacion_original . ' (Tel 2: ' . $telefono_extra . ')';
            }
            if (empty($telefono)) $telefono = 'Sin numero'; 

            // Extraer y guardar IP
            $ip_raw = trim($data[6] ?? '');
            if (!empty($ip_raw)) {
                $ip_esc = $pdo->quote($ip_raw);
                $nom_esc = $pdo->quote($nombre_cliente);
                $tel_esc = $pdo->quote($telefono);
                fwrite($ipFile, "INSERT INTO IPs_Respaldo (Nombre_Cliente, Telefono, IP) VALUES ($nom_esc, $tel_esc, $ip_esc);\n");
            }

            // --- 2. MAPEO DE LOCALIDAD ---
            $localidadId = mapearLocalidad($ubicacion_original);
            
            // --- 3. LIMPIEZA Y CÁLCULO DE FECHA DE INSTALACIÓN ---
            $fecha_raw = strtoupper(trim($data[4] ?? ''));
            $fecha_instalacion = null; 

            // Si escribieron cosas de "1 AL 5", lo tratamos como vacío
            if (strpos($fecha_raw, '1 AL 5') !== false) {
                $fecha_raw = '';
            }

            // Intentamos extraer la fecha si existe
            if (!empty($fecha_raw)) {
                $fecha_limpia = trim(str_replace('INST.', '', $fecha_raw));
                $dateObj = DateTime::createFromFormat('d/m/Y', $fecha_limpia);
                if ($dateObj) {
                    $fecha_instalacion = $dateObj->format('Y-m-d H:i:s');
                }
            }

            // Si no hubo fecha (o estaba mal escrita), LA CALCULAMOS
            if ($fecha_instalacion === null) {
                $mes_inicio = 1; // Default a Enero
                $anio_inicio = 2025;
                
                // Pre-escaneamos las columnas de pagos (8 a 31)
                for ($col = 8; $col <= 31; $col++) {
                    if (isset($data[$col])) {
                        $monto_pre = (float) preg_replace('/[^0-9.]/', '', $data[$col]);
                        if ($monto_pre > 0) {
                            if ($col <= 19) {
                                $mes_inicio = $col - 7;
                                $anio_inicio = 2025;
                            } else {
                                $mes_inicio = $col - 19;
                                $anio_inicio = 2026;
                            }
                            break; 
                        }
                    }
                }
                
                $mes_formateado = str_pad($mes_inicio, 2, '0', STR_PAD_LEFT);
                $fecha_instalacion = $anio_inicio . '-' . $mes_formateado . '-01 00:00:00';
            }

            // --- 4. LÓGICA DE ENRUTAMIENTO ---
            $antena_ap = strtoupper(trim($data[5] ?? ''));
            $esFibra = (strpos($antena_ap, 'FIBRA') !== false);
            $tipo = $esFibra ? 'Fibra' : 'Antena';
            $oltId = $esFibra ? $defaultOltId : null;
            $torreId = $esFibra ? null : $defaultTorreId;

            // --- PASO A: CREAR CLIENTE ---
            $stmt = $pdo->prepare("INSERT INTO Cliente (Nombre_Cliente, Telefono, Direccion, TipoCliente) VALUES (?, ?, ?, 'Fisica')");
            $stmt->execute([$nombre_cliente, $telefono, $ubicacion_original]);
            $clienteId = $pdo->lastInsertId();

            // --- PASO B: CREAR INSTALACIÓN ---
            $stmt = $pdo->prepare("INSERT INTO Instalacion (UsuarioId, ClienteId, OLTId, TorreId, LocalidadId, Tipo, Plan, Fecha_Instalacion) VALUES (?, ?, ?, ?, ?, ?, '20 MEGAS', ?)");
            $stmt->execute([$defaultUsuarioId, $clienteId, $oltId, $torreId, $localidadId, $tipo, $fecha_instalacion]);
            $instalacionId = $pdo->lastInsertId();

            // --- PASO C: PROCESAR MESES Y PAGOS ---
            $pagos_insertar = [];
            // Pagos 2025 (columnas 8 a 19)
            for ($i = 8; $i <= 19; $i++) {
                if (isset($data[$i])) {
                    $monto = (float) preg_replace('/[^0-9.]/', '', $data[$i]);
                    if ($monto > 0) {
                        $pagos_insertar[] = ['mes' => $i - 7, 'anio' => 2025, 'monto' => $monto];
                    }
                }
            }
            // Pagos 2026 (columnas 20 a 31)
            for ($i = 20; $i <= 31; $i++) {
                if (isset($data[$i])) {
                    $monto = (float) preg_replace('/[^0-9.]/', '', $data[$i]);
                    if ($monto > 0) {
                        $pagos_insertar[] = ['mes' => $i - 19, 'anio' => 2026, 'monto' => $monto];
                    }
                }
            }

            foreach ($pagos_insertar as $p) {
                $stmt = $pdo->prepare("INSERT INTO Mensualidad (InstalacionId, Mes, Anio, Concepto, Monto, Estado) VALUES (?, ?, ?, 'Mensualidad Migración', ?, 'Pagado')");
                $stmt->execute([$instalacionId, $p['mes'], $p['anio'], $p['monto']]);
                $mensualidadId = $pdo->lastInsertId();

                $stmt = $pdo->prepare("INSERT INTO Pago (InstalacionId, UsuarioId, Tipo_Pago, Monto) VALUES (?, ?, 'Efectivo', ?)");
                $stmt->execute([$instalacionId, $defaultUsuarioId, $p['monto']]);
                $pagoId = $pdo->lastInsertId();

                $stmt = $pdo->prepare("INSERT INTO Pago_Detalle (PagoId, MensualidadId, Monto_Abonado) VALUES (?, ?, ?)");
                $stmt->execute([$pagoId, $mensualidadId, $p['monto']]);
            }

            $pdo->commit(); 
            $registrosExitosos++;

        } catch (Exception $e) {
            $pdo->rollBack(); 
            echo "Error en cliente {$nombre_cliente}: " . $e->getMessage() . "<br>\n";
            $errores++;
        }
        
    }
    
    fclose($handle);
    fclose($ipFile);
    echo "<hr><strong>Migración finalizada.</strong><br>\n";
    echo "Clientes importados con éxito: $registrosExitosos <br>\n";
    echo "Errores detectados: $errores <br>\n";

} else {
    echo "No se pudo abrir el archivo CSV.";
}
?>