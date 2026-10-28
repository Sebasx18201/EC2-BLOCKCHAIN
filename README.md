# Evidencias documentales MINSA · Semana 11

Prototipo academico de registro de evidencias documentales para un piloto de interoperabilidad entre establecimientos seleccionados del MINSA. Esta entrega se concentra en la Actividad 11: contrato Solidity, pruebas en Remix e interfaz minima conectada a Sepolia.

---

## Datos del equipo

| Integrante | Rol |
|---|---|
| Piero Alessandro Moreno Salas | Contrato |
| Stiven Jhosue Moreno Inca | Pruebas y documentacion |
| Sebastian Marco Ramirez Coronado | Interfaz |

---

## Que hace este proyecto

Los antecedentes clinicos pueden quedar fragmentados entre establecimientos. El proyecto propone mantener los documentos en sus sistemas de origen y registrar en blockchain evidencia tecnica para apoyar la integridad y la trazabilidad. Este laboratorio representa solamente el registro y la consulta de la huella de una version documental, con escritura restringida al administrador y emision de un evento.

En blockchain se guardan identificadores documentales ficticios, hashes SHA-256, codigos de establecimiento, autor y fecha. Las historias clinicas, nombres, DNI, diagnosticos y la correspondencia de identidad permanecen fuera de blockchain. El contrato recibe un hash calculado externamente; no recupera el documento ni certifica su veracidad medica.

La funcionalidad corresponde principalmente a RF07 (registro de evidencia) de la Semana 9 y a los patrones de anclaje de hashes, control de acceso y eventos definidos en la Semana 10. Proporciona la huella necesaria para una futura comparacion de integridad (RF08), sin implementarla todavia. La integracion FHIR R4, los permisos de pacientes y la infraestructura permisionada completa quedan fuera de esta actividad.

---

## Contrato desplegado

| Dato | Valor |
|---|---|
| Nombre del contrato | RegistroProyecto |
| Red utilizada por la interfaz | Ethereum Sepolia (11155111) |
| Direccion en Sepolia | 0x75Aa28803A417c9C588DeD4a8142f1DeF8A6C38a |
| Fecha de despliegue | 28/10/2026 |

El archivo `contracts/RegistroProyecto.sol` todavia es la plantilla del curso. Antes de entregar, el equipo debe exportar desde Remix el `EC2.sol` final que desplego y guardarlo en `contracts/`. La interfaz utiliza la ABI suministrada por el equipo para ese contrato final, no la de la plantilla.

---

## Como ejecutarlo

### El contrato

1. Entrar a https://remix.ethereum.org
2. Crear el archivo `.sol` dentro de la carpeta `contracts`
3. Pegar el contenido de `contracts/RegistroProyecto.sol` y adaptarlo a su caso
4. Compilar con la version 0.8.24
5. Desplegar en el entorno Remix VM
6. Copiar la direccion del contrato desplegado

### La interfaz

La interfaz minima esta en `frontend/` y permite conectar MetaMask, registrar una evidencia y consultarla. Los datos son publicos: utilizar solo identificadores ficticios, codigos de establecimiento y hashes SHA-256. No introducir nombres, DNI ni contenido clinico.

| Archivo | Responsabilidad |
|---|---|
| `frontend/index.html` | Formularios, botones y resultados |
| `frontend/styles.css` | Presentacion y adaptacion al movil |
| `frontend/abi.js` | ABI exportada desde Remix y suministrada por el equipo |
| `frontend/app.js` | Configuracion de Sepolia, conexion, lectura, escritura y errores |

La direccion del contrato esta en `DIRECCION_CONTRATO`, al inicio de `frontend/app.js`. Si se vuelve a desplegar, actualizarla. Si cambia el contrato, actualizar tambien `frontend/abi.js` con la nueva ABI.

Para abrirla en Chrome desde VS Code, abrir **Terminal > Nueva terminal** en la carpeta del proyecto y ejecutar:

```text
node iniciar-interfaz.cjs
```

Abrir `http://127.0.0.1:4173` en Chrome y mantener la terminal activa. Para detener la vista, pulsar **Ctrl+C**. Este archivo solo sirve los cuatro archivos del frontend en el equipo local; la conexion blockchain sigue realizandose con Sepolia. Requiere Node.js disponible (ya instalado en el equipo de trabajo), sin paquetes adicionales.

Tambien se puede usar una vista previa HTTP disponible en el editor, o GitHub Pages. No requiere compilar el frontend. Requiere internet para cargar ethers 6.13.5 desde cdnjs y acceder a Sepolia. Abrir el archivo directamente mediante `file://` puede impedir que MetaMask se conecte segun sus permisos. El ayudante local no se necesita para GitHub Pages ni para el flujo del profesor desde el navegador.

Para publicar desde el navegador:

1. En el repositorio, usar **Add file > Upload files** para subir la carpeta `frontend` con sus cuatro archivos y confirmar los cambios.
2. En **Settings > Pages**, seleccionar **Deploy from a branch**, rama **main** y carpeta **/(root)**, y guardar.
3. Cuando GitHub confirme la publicacion, abrir la URL que proporcione y agregar `/frontend/`. La URL prevista, pendiente de habilitar y verificar, es `https://sebasx18201.github.io/EC2-BLOCKCHAIN/frontend/`.

Prueba de la interfaz:

1. Al abrirla, comprobar el administrador y el contador. Usa un RPC publico de lectura y permite consultar sin conectar la billetera. La disponibilidad depende de ese servicio externo.
2. Pulsar **Conectar MetaMask**, autorizar la cuenta que desplego el contrato y comprobar Sepolia. La pagina solicitara el cambio de red si es necesario. La billetera tambien proporciona lectura si falla el RPC publico.
3. Registrar `DOC-001-V1`, `MINSA-A` y el hash `0x279fc8e4b379d736458dc6106bb28c2091f259132f3e582d915f3c7a28da228a`. Es el SHA-256 del texto sintetico `Documento sintetico MINSA A - version 1`, sin salto de linea final.
4. Confirmar la transaccion en MetaMask. La interfaz muestra espera de firma, espera de confirmacion y el numero de registro extraido del evento `RegistroCreado`.
5. Consultar ese numero (0 si es el primero) y comprobar los datos y el contador.
6. Repetir una solicitud y rechazarla en MetaMask para verificar el mensaje de rechazo. Si cambia la cuenta o la red, volver a conectar antes de escribir.

Solo el administrador puede registrar. La interfaz bloquea una cuenta distinta antes de enviar la escritura; la reversion del contrato por falta de permiso se prueba por separado en Remix VM. El formulario recibe hashes ya calculados: no calcula huellas ni compara documentos. Cada escritura agrega un registro nuevo, incluso si se repite un identificador.

La sintaxis y los flujos principales se verificaron con conexiones simuladas. La presentacion en navegador y las operaciones con MetaMask y el contrato real siguen pendientes de probar desde esta interfaz. Todavia no se ha publicado en GitHub Pages.

---

## Pruebas realizadas

Las siguientes pruebas se realizaron en Remix VM sobre el contrato final `RegistroProyecto`. Las capturas fueron proporcionadas por el equipo durante el laboratorio y se conservaron sin modificar su contenido. Corresponden al despliegue de Remix VM, no al despliegue posterior en Sepolia ni a pruebas de la interfaz.

| Caso | Que se probo | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| Dato valido | Administrador registra `DOC-001-V1`, `MINSA-A` y un hash valido | Se guarda la evidencia, puede consultarse y se emite el evento | Transaccion exitosa; `obtenerRegistro(0)` devuelve los datos y se observa `RegistroCreado`. [Captura](docs/prueba-dato-valido.png) y [evento](docs/prueba-evento-registrado.png) |
| Usuario sin permiso | Otra cuenta intenta registrar `DOC-002-V1` en `MINSA-B` | Revierte con `No autorizado` y no agrega un registro | Se observa la reversion; el contador permanece en 1. [Error](docs/prueba-sin-permiso.png) y [contador](docs/prueba-sin-permiso-contador.png) |
| Dato invalido | Administrador intenta registrar con ID documental vacio | Revierte por ID vacio y no agrega un registro | Se observa `El ID documental no puede estar vacio`; el contador permanece en 1. [Error](docs/prueba-dato-invalido.png) y [contador](docs/prueba-dato-invalido-contador.png) |

La guia para reproducir las pruebas y visualizar las seis capturas esta en [docs/PRUEBAS.md](docs/PRUEBAS.md).

---

## Uso de inteligencia artificial

Se utilizo inteligencia artificial como apoyo para preparar la interfaz y la documentacion. El equipo debe revisar el resultado y declarar sus propias modificaciones y verificaciones.

| Herramienta usada | Para que parte | Prompt principal utilizado |
|---|---|---|
| OpenAI Codex | Interfaz minima HTML/CSS/JavaScript, integracion con ABI y direccion aportadas por el equipo, y comprobaciones con conexiones simuladas | Crear una interfaz sencilla para la Actividad 11: conectar una billetera, leer y enviar una transaccion; mantener coherencia con semanas 9 y 10 y explicar el codigo |

Revision y modificaciones realizadas por cada integrante: Stiven y Piero se encargaron de verificar el contrato y confirmar que tenga relación con nuestro proyecto planteado. Sebastian hizo unos ajustes finales al contrato y realizó la conexión con la billetera MetaMask que fue la empleada en esta ocasión.

Cada integrante debe poder explicar en clase cualquier linea del codigo entregado.

---

## Estructura del repositorio

```
contracts/    el contrato en Solidity
frontend/     la interfaz construida por el equipo
docs/         capturas, diagrama y evidencias
README.md     este archivo
iniciar-interfaz.cjs    vista HTTP local opcional, sin paquetes adicionales
```

---

## Pendientes antes de la entrega final

- Exportar y guardar en `contracts/` el `EC2.sol` final que corresponde a la ABI y los despliegues; el archivo actual sigue siendo la plantilla del curso.
- Probar y documentar la conexion, lectura, escritura y rechazo de firma desde la interfaz con MetaMask en Sepolia.
- Si se utiliza GitHub Pages, habilitar la publicacion y verificar el enlace de la interfaz.
- Conservar aportes reales y visibles de los tres integrantes. Este cambio no sustituye sus contribuciones individuales.

---

## Advertencia

Nunca suban a este repositorio su clave privada ni la frase de recuperacion de su billetera.
