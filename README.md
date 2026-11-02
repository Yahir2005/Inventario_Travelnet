# 🌐 Sistema de Inventario, Instalaciones y Cobranza — TravelNet

¡Bienvenido/a al proyecto **TravelNet**!  
Esta guía está escrita paso a paso y en un lenguaje sencillo para que cualquier persona —incluso si apenas está comenzando en el mundo de la programación— pueda entender cómo está construido el sistema y cómo ponerlo a funcionar en su propia computadora.

---

## 🧠 1. ¿Cómo funciona el sistema? (Explicación sencilla)

Imagina que este sistema funciona como un **restaurante**:

1. **El Frontend (`Frontend/` — Angular):**  
   Es el **menú y el comedor** que ve el cliente en su pantalla (botones, tablas, formularios, modo oscuro, cámara para fotos). Está hecho con **Angular**.
2. **El Backend (`Backend/` — Node.js + Express):**  
   Es el **mesero y el cocinero**. Recibe las peticiones que hace la pantalla (por ejemplo: *"guarda este pago"* o *"dame la lista de clientes"*), revisa que el usuario tenga permiso y se comunica con la base de datos.
3. **La Base de Datos (`Database/` — MariaDB / MySQL):**  
   Es el **archivero** donde se guarda toda la información de forma segura (clientes, planes de internet, instalaciones, pagos, cortes de caja y usuarios).
4. **El Modo Offline (Sin Internet — IndexedDB / Dexie):**  
   Es como una **libreta de notas temporal** dentro del navegador. Si un instalador en la calle se queda sin internet, el navegador guarda el cliente, la instalación, la foto o el pago en esa libreta (`IndexedDB`). En cuanto regresa el internet, el sistema envía todo automáticamente al servidor.

---

## 📁 2. Estructura del Proyecto

El proyecto se divide en **3 carpetas principales**:

```text
Inventario_Travelnet/
├── Database/                 # Archivos SQL para crear la base de datos
│   └── Travelnet.sql         # Estructura de tablas y procedimientos almacenados
│
├── Backend/                  # Servidor (Node.js + Express)
│   ├── app.js                # Archivo principal que configura el servidor y la seguridad
│   ├── bin/www               # Archivo que enciende el servidor en el puerto 3000
│   ├── public/uploads/       # Carpeta donde se guardan las fotos de las instalaciones
│   ├── routes/               # Define las direcciones URL (ej. /api/cliente, /api/pago)
│   └── src/
│       ├── config/           # Conexión a MariaDB (database.js) y llave secreta (jwt.js)
│       ├── controller/       # Recibe los datos del navegador y responde (Controladores)
│       └── model/            # Contiene las consultas SQL hacia la base de datos (Modelos)
│
└── Frontend/                 # Aplicación Web (Angular)
    └── src/
        ├── environments/     # Configuración de la dirección del servidor (localhost:3000)
        └── app/
            ├── db/           # Base de datos local (app.db.ts) para funcionar sin internet
            ├── shared/       # Componentes compartidos (barra de navegación, login guard)
            └── features/     # Módulos del sistema organizados por tema:
                ├── home/                 # Panel principal con tarjetas de resumen
                ├── usuario/              # Login y administración de usuarios
                ├── cliente/              # Registro y listado de clientes
                ├── instalacion/          # Registro de instalaciones con ubicación GPS
                ├── imagen_instalacion/   # Captura de fotos con marca de agua y GPS
                ├── pago/                 # Cobros, recibos/tickets y sincronización offline
                ├── mensualidad/          # Historial de meses pagados o cancelados
                ├── corte-caja/           # Cortes de caja diarios
                ├── plan/                 # Planes de megas y tarifas
                ├── OLT/                  # Equipos de fibra óptica
                └── Torre/                # Antenas / torres inalámbricas
```

---

## ⚙️ 3. ¿Cómo funcionan los métodos por dentro?

### En el Backend (`Backend/`)
Cada módulo (por ejemplo, `Cliente`, `Instalacion` o `Pago`) sigue siempre el mismo camino de **3 pasos**:

1. **Ruta (`Backend/routes/*.js`)**:  
   Escucha una dirección web.  
   *Ejemplo:* Cuando el navegador pide `GET /api/cliente`, la ruta llama al controlador.
2. **Controlador (`Backend/src/controller/*Controller.js`)**:  
   Revisa que los datos enviados estén completos. Tiene funciones con nombres fáciles de identificar:
   - `getAll(req, res)`: Pide todos los registros para mostrarlos en una tabla.
   - `getById(req, res)`: Busca un solo registro por su número de ID.
   - `create(req, res)`: Crea un registro nuevo (un nuevo cliente, pago o instalación).
   - `update(req, res)`: Modifica un registro que ya existía.
   - `remove(req, res)`: Desactiva o elimina un registro.
3. **Modelo (`Backend/src/model/*.js`)**:  
   Habla directamente con MariaDB usando comandos SQL (`SELECT`, `INSERT`, `UPDATE`).
   - `findAll(db)`: Ejecuta un `SELECT` para traer la lista.
   - `findByPk(db, id)`: Busca una fila específica por su llave primaria (`Id`).
   - `create(db, data)`: Inserta los datos con `INSERT INTO`. En pagos y cortes usa **transacciones** (`beginTransaction` y `commit`) para que nunca se guarde un dato a medias.
   - `update(db, id, data)`: Actualiza únicamente los campos modificados con `UPDATE`.

### En el Frontend (`Frontend/`)
El código de Angular está organizado por **funcionalidades (`features/`)**. Dentro de cada carpeta encontrarás:

1. **Servicios (`services/*.ts`)**:  
   Son los encargados de hablar con el Backend usando `HttpClient`.  
   - Cuando hay internet, descargan la información y guardan una copia en `IndexedDB` (`cacheClientes`, `cacheInstalaciones`, `cachePagos`, etc.).
   - Si no hay internet, su bloque `catchError` rescata automáticamente los datos guardados en la computadora para que la pantalla siga funcionando.
2. **Páginas / Componentes (`pages/*.ts` y `*.html`)**:  
   Controlan lo que ves en pantalla:
   - `ngOnInit()`: Es el método que se ejecuta automáticamente en cuanto abres una pantalla (carga las listas y verifica qué rol tiene tu usuario).
   - `guardarCliente()`, `guardarInstalacion()`, `guardarPago()`: Revisan el formulario y envían la información al servidor (o la guardan en modo offline si no hay red).
   - `imprimirTicket()` / `imprimirTicketCorte()`: Generan el comprobante listo para impresora térmica de tickets.
   - `toggleTheme()`: Cambia entre **Modo Claro** y **Modo Oscuro** guardando tu preferencia.
3. **Servicio de Sincronización (`SyncService` en `features/pago/services/sync.service.ts`)**:  
   - `estaEnLinea()`: Detecta si tienes conexión a internet.
   - `encolarClienteOffline()`, `encolarInstalacionOffline()`, `encolarImagenOffline()`, `encolarPagoOffline()`: Guardan registros nuevos en la memoria del navegador cuando no hay internet.
   - `sincronizarTodo()`: Se activa solo cuando vuelve el internet (o al presionar el botón de pendientes en la barra superior) y sube todo en orden: **1° Clientes ➔ 2° Instalaciones ➔ 3° Fotos ➔ 4° Pagos**.

---

## 🛠️ 4. Requisitos para instalar en otra computadora

Antes de empezar en una computadora nueva (Windows, Linux o Mac), necesitas instalar estos **3 programas gratuitos**:

1. **Node.js (versión 18, 20 o 22 LTS):**  
   Es el motor que ejecuta tanto el Backend como las herramientas de Angular.  
   👉 Descárgalo en: [https://nodejs.org/](https://nodejs.org/)
2. **MariaDB (o MySQL / XAMPP):**  
   Es el gestor de base de datos.  
   👉 Descárgalo en: [https://mariadb.org/download/](https://mariadb.org/download/)
3. **Git (opcional pero recomendado):**  
   Para clonar/descargar el código del proyecto.  
   👉 Descárgalo en: [https://git-scm.com/](https://git-scm.com/)

> 💡 **¿Cómo saber si Node.js se instaló bien?**  
> Abre tu terminal (o Símbolo del sistema / PowerShell en Windows) y escribe:
> ```bash
> node -v
> npm -v
> ```
> Si ambos te responden con un número de versión, ¡ya estás listo!

---

## 🚀 5. Guía Paso a Paso para Ejecutar el Proyecto en Local

Sigue estos **5 pasos en orden** en la computadora donde quieras correr el proyecto:

### Paso 1: Obtener la carpeta del proyecto
Copia la carpeta `Inventario_Travelnet` a tu computadora (o clónala con Git) y entra a ella desde la terminal:
```bash
cd Inventario_Travelnet
```

---

### Paso 2: Preparar la Base de Datos en MariaDB
1. Abre tu terminal de MariaDB/MySQL (con tu usuario administrador, por ejemplo `root`):
   ```bash
   mysql -u root -p
   ```
2. Importa el archivo que crea la base de datos `Travelnet` y todas sus tablas:
   ```bash
   mysql -u root -p < Database/Travelnet.sql
   ```
3. Crea los usuarios de base de datos por rol ejecutando en tu consola de MariaDB/MySQL los comandos SQL de creación de usuarios (`mysql_login`, `mysql_admin`, `mysql_mostrador`, `mysql_instalador`) o usando tu usuario administrador de MariaDB en el archivo `.env`.

---

### Paso 3: Crear el archivo `.env` en el Backend
El Backend necesita saber cómo conectarse a tu base de datos.  
Dentro de la carpeta `Backend/`, crea un archivo llamado exactamente **`.env`** con el siguiente contenido (puedes ajustar las contraseñas según tu base de datos local):

```env
PORT=3000
DB_HOST=localhost
DB_NAME=Travelnet

# Secreto para firmar sesiones JWT (debe tener al menos 16 caracteres)
JWT_SECRET=TravelNet_Clave_Secreta_Segura_2026!

# Usuarios de Base de Datos por Rol
DB_USER_LOGIN=mysql_login
DB_PASS_LOGIN=wSN89tFdP/kJBoO//X/Dmw==

DB_USER_ADMIN=mysql_admin
DB_PASS_ADMIN=2VVW/ny586Va9IYw77yzpw==

DB_USER_MOSTRADOR=mysql_mostrador
DB_PASS_MOSTRADOR=VXOqrWgXLHncpIDtJX5QEQ==

DB_USER_INSTALADOR=mysql_instalador
DB_PASS_INSTALADOR=VGTrJToS78W/SKwuXdOzfQ==
```

> 💡 **Tip para principiantes:** Si en tu computadora de pruebas solo tienes el usuario `root` en tu base de datos, puedes poner `root` en los cuatro `DB_USER_*` y la contraseña de tu `root` en los cuatro `DB_PASS_*` para probar rápidamente.

---

### Paso 4: Instalar y encender el Backend (Servidor)
Abre una terminal, entra a la carpeta `Backend`, instala sus librerías y enciéndelo:

```bash
cd Backend
npm install
npm start
```

Sabrás que todo salió bien cuando veas en la consola el mensaje:
```text
✅ Conectado a MariaDB correctamente.
```
*(Deja esta ventana de terminal abierta para que el servidor siga encendido en `http://localhost:3000`).*

---

### Paso 5: Instalar y encender el Frontend (Pantalla Web)
Abre **una segunda ventana de terminal**, entra a la carpeta `Frontend`, instala sus librerías y enciéndelo:

```bash
cd Frontend
npm install
npm start
```

Cuando termine de cargar, abre tu navegador (Chrome, Edge o Firefox) y entra a:
👉 **[http://localhost:4200](http://localhost:4200)**

---

## 📱 6. ¿Cómo abrir el sistema desde otro dispositivo en la misma red Wi-Fi?

Si quieres probar el sistema desde un celular o desde otra laptop conectada al mismo módem/Wi-Fi:

1. Averigua la **dirección IP local** de la computadora que tiene encendido el proyecto (por ejemplo `192.168.1.50`):
   - En Windows: escribe `ipconfig` en la terminal.
   - En Linux/Mac: escribe `hostname -I` o `ip a`.
2. Abre el archivo `Frontend/src/environments/environment.ts` y cambia `localhost` por esa IP:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://192.168.1.50:3000/api',
     serverUrl: 'http://192.168.1.50:3000'
   };
   ```
3. En `Backend/app.js`, agrega `http://192.168.1.50:4200` en la lista de `cors({ origin: [...] })`.
4. Inicia Angular permitiendo conexiones externas:
   ```bash
   npx ng serve --host 0.0.0.0
   ```
5. Desde el otro dispositivo, entra en el navegador a `http://192.168.1.50:4200`.

---

## ❓ 7. Solución de Problemas Comunes

| Problema | ¿Por qué ocurre? | ¿Cómo lo soluciono? |
| :--- | :--- | :--- |
| **`Error al conectar con MariaDB: Access denied`** | El usuario o contraseña en `Backend/.env` no coincide con el de tu MariaDB. | Revisa los valores `DB_USER_*` y `DB_PASS_*` en `Backend/.env`. |
| **`JWT_SECRET no está configurado`** | Falta el archivo `.env` dentro de la carpeta `Backend/`. | Crea el archivo `Backend/.env` como se indica en el **Paso 3**. |
| **`Port 3000 is already in use`** | Ya tienes otra terminal con el Backend encendido. | Cierra la terminal anterior o detén el proceso con `Ctrl + C`. |
| **No abre la cámara al tomar foto de evidencia** | Los navegadores solo permiten usar la cámara en `localhost` o con `https://`. | Haz la prueba entrando desde `http://localhost:4200` o usa el botón de **Subir imagen manual**. |
