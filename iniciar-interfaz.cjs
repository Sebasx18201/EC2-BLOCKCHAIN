// Vista local del frontend. Usa solo Node.js, sin instalar paquetes.
// Desde la carpeta del proyecto: node iniciar-interfaz.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const carpeta = path.join(__dirname, 'frontend');
const archivos = {
  'index.html': 'text/html; charset=utf-8',
  'styles.css': 'text/css; charset=utf-8',
  'abi.js': 'application/javascript; charset=utf-8',
  'app.js': 'application/javascript; charset=utf-8'
};

const servidor = http.createServer((solicitud, respuesta) => {
  if (!['GET', 'HEAD'].includes(solicitud.method)) {
    respuesta.writeHead(405, { Allow: 'GET, HEAD' });
    respuesta.end();
    return;
  }

  const ruta = new URL(solicitud.url, 'http://localhost').pathname;
  const nombre = ruta.replace(/^\/(frontend\/)?/, '') || 'index.html';
  if (!Object.hasOwn(archivos, nombre)) {
    respuesta.writeHead(404);
    respuesta.end('Archivo no encontrado');
    return;
  }

  fs.readFile(path.join(carpeta, nombre), (error, contenido) => {
    if (error) {
      respuesta.writeHead(500);
      respuesta.end('No se pudo leer el archivo de la interfaz.');
      return;
    }
    respuesta.writeHead(200, { 'Content-Type': archivos[nombre], 'Cache-Control': 'no-store' });
    respuesta.end(solicitud.method === 'HEAD' ? undefined : contenido);
  });
});

servidor.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'El puerto 4173 esta ocupado. Cierra la vista anterior antes de iniciar otra.'
    : `No se pudo iniciar la vista local: ${error.message}`);
  process.exitCode = 1;
});

servidor.listen(4173, '127.0.0.1', () => {
  console.log('Abre en Chrome: http://127.0.0.1:4173');
  console.log('Para detener la vista, pulsa Ctrl+C en esta terminal.');
});
