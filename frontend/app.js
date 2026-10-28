// 1. CONFIGURACION: actualizar la direccion si el equipo vuelve a desplegar.
const DIRECCION_CONTRATO = '0x75Aa28803A417c9C588DeD4a8142f1DeF8A6C38a'.toLowerCase();
const RED_SEPOLIA = 11155111n;
const RPC_LECTURA = 'https://ethereum-sepolia-rpc.publicnode.com';
const EXPLORADOR = 'https://sepolia.etherscan.io';
const elemento = (id) => document.getElementById(id);

let contratoLectura;
let contratoEscritura;
let proveedorBilletera;
let cuentaConectada = '';
let ocupado = false;

function mostrarEstado(mensaje, tipo = 'info') {
  elemento('estado').textContent = mensaje;
  elemento('estado').dataset.tipo = tipo;
}

function actualizarBotones() {
  elemento('conectar').disabled = ocupado;
  elemento('actualizar').disabled = ocupado || !contratoLectura;
  elemento('consultar').disabled = ocupado || !contratoLectura;
  elemento('registrar').disabled = ocupado || !contratoEscritura;
}

// Todas las operaciones muestran espera y recuperan los botones al terminar.
async function ejecutar(accion) {
  if (ocupado) return;
  ocupado = true;
  actualizarBotones();
  try {
    await accion();
  } catch (error) {
    mostrarEstado(mensajeError(error), 'error');
  } finally {
    ocupado = false;
    actualizarBotones();
  }
}

function mensajeError(error) {
  const codigo = error.code ?? error.info?.error?.code;
  if (codigo === 4001 || codigo === 'ACTION_REJECTED') {
    return 'Rechazaste la solicitud en MetaMask. La aplicación no confirmó una nueva operación.';
  }
  if (codigo === 'INSUFFICIENT_FUNDS') return 'Saldo insuficiente de SepoliaETH para la comisión.';
  if (codigo === 'NETWORK_ERROR' || codigo === 'SERVER_ERROR') {
    return 'No se pudo conectar con Sepolia. Comprueba tu conexión y vuelve a intentar.';
  }
  return error.reason || error.shortMessage || error.message || 'No se pudo completar la operación.';
}

async function actualizarResumen() {
  const [administrador, total] = await Promise.all([
    contratoLectura.administrador(), contratoLectura.totalRegistros()
  ]);
  elemento('administrador').textContent = administrador;
  elemento('total').textContent = total.toString();
}

// 2. CONECTAR: MetaMask conserva las claves y solicita las confirmaciones.
async function conectar() {
  const billetera = window.ethereum?.providers?.find((p) => p.isMetaMask) || window.ethereum;
  if (!billetera) throw new Error('Abre la página en Chrome, donde tienes instalada MetaMask.');
  contratoEscritura = null;
  cuentaConectada = '';
  elemento('cuenta').textContent = 'Sin conectar';
  mostrarEstado('Esperando que autorices la conexión en MetaMask…');
  await billetera.request({ method: 'eth_requestAccounts' });
  const red = await billetera.request({ method: 'eth_chainId' });
  if (BigInt(red) !== RED_SEPOLIA) {
    await billetera.request({
      method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }]
    });
  }
  proveedorBilletera = new ethers.BrowserProvider(billetera);
  if ((await proveedorBilletera.getNetwork()).chainId !== RED_SEPOLIA) {
    throw new Error('Selecciona Ethereum Sepolia en MetaMask y vuelve a conectar.');
  }
  if (await proveedorBilletera.getCode(DIRECCION_CONTRATO) === '0x') {
    throw new Error('No se encontró el contrato en Sepolia. Revisa la dirección del despliegue.');
  }
  const firmante = await proveedorBilletera.getSigner();
  cuentaConectada = await firmante.getAddress();
  contratoEscritura = new ethers.Contract(DIRECCION_CONTRATO, ABI_CONTRATO, firmante);
  // La billetera también sirve para leer si el servicio público no responde.
  contratoLectura = new ethers.Contract(DIRECCION_CONTRATO, ABI_CONTRATO, proveedorBilletera);
  elemento('cuenta').textContent = cuentaConectada;
  await actualizarResumen();
  const esAdministrador = cuentaConectada.toLowerCase() === elemento('administrador').textContent.toLowerCase();
  mostrarEstado(esAdministrador
    ? 'Cuenta administradora conectada. Puedes consultar y registrar evidencias.'
    : 'Cuenta conectada. Puedes consultar; solo el administrador puede registrar.', 'exito');
  if (billetera !== conectar.billeteraObservada) {
    billetera.on?.('accountsChanged', invalidarConexion);
    billetera.on?.('chainChanged', invalidarConexion);
    conectar.billeteraObservada = billetera;
  }
}

function invalidarConexion() {
  contratoEscritura = null;
  cuentaConectada = '';
  elemento('cuenta').textContent = 'Vuelve a conectar';
  contratoLectura = new ethers.Contract(DIRECCION_CONTRATO, ABI_CONTRATO,
    new ethers.JsonRpcProvider(RPC_LECTURA, Number(RED_SEPOLIA)));
  mostrarEstado('Cambiaste la cuenta o la red. Vuelve a conectar MetaMask antes de registrar.');
  actualizarBotones();
}

// 3. ESCRITURA: validar, solicitar firma, esperar el recibo y leer el evento.
async function registrar() {
  elemento('transaccion').hidden = true;
  if (!contratoEscritura) throw new Error('Conecta MetaMask primero.');
  const documento = elemento('documento').value.trim();
  const establecimiento = elemento('establecimiento').value.trim();
  const hash = elemento('hash').value.trim();
  if (!documento || !establecimiento) throw new Error('Completa el ID documental y el establecimiento.');
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash) || /^0x0{64}$/.test(hash)) {
    throw new Error('El hash debe contener 0x y 64 caracteres hexadecimales, y no puede ser cero.');
  }
  if ((await proveedorBilletera.getNetwork()).chainId !== RED_SEPOLIA) {
    throw new Error('Selecciona Ethereum Sepolia y vuelve a conectar MetaMask.');
  }
  const administrador = await contratoEscritura.administrador();
  if (cuentaConectada.toLowerCase() !== administrador.toLowerCase()) {
    throw new Error('No autorizado: conecta la cuenta que desplegó el contrato.');
  }
  const contratoActual = contratoEscritura;
  mostrarEstado('Esperando tu confirmación en MetaMask…');
  const tx = await contratoActual.crearRegistro(documento, establecimiento, hash);
  elemento('enlace-tx').href = `${EXPLORADOR}/tx/${tx.hash}`;
  elemento('transaccion').hidden = false;
  mostrarEstado('Transacción enviada. Esperando confirmación en Sepolia…');
  const recibo = await tx.wait();
  if (!recibo || recibo.status !== 1) throw new Error('La transacción no se confirmó correctamente. Revisa el enlace.');
  let numeroRegistro = '';
  for (const log of recibo.logs) {
    if (log.address.toLowerCase() !== DIRECCION_CONTRATO) continue;
    try {
      const evento = contratoActual.interface.parseLog(log);
      if (evento?.name === 'RegistroCreado') numeroRegistro = evento.args.id.toString();
    } catch { /* El recibo puede incluir otros eventos. */ }
  }
  if (numeroRegistro !== '') elemento('registro-id').value = numeroRegistro;
  const mensaje = numeroRegistro === '' ? 'Evidencia registrada y confirmada.'
    : `Registro ${numeroRegistro} confirmado. Evento RegistroCreado recibido. Ya puedes consultarlo.`;
  mostrarEstado(mensaje, 'exito');
  try { await actualizarResumen(); }
  catch { mostrarEstado(`${mensaje} No se pudo actualizar el contador; pulsa Actualizar contador.`, 'exito'); }
}

// 4. LECTURA: el proveedor permite consultar sin pedir una firma.
async function consultar() {
  elemento('resultado').hidden = true;
  const textoId = elemento('registro-id').value.trim();
  if (!/^\d+$/.test(textoId)) throw new Error('Introduce un número de registro entero, desde 0.');
  const id = BigInt(textoId);
  if (id >= (1n << 256n)) throw new Error('El número de registro excede el rango permitido.');
  mostrarEstado('Consultando la evidencia en Sepolia…');
  const r = await contratoLectura.obtenerRegistro(id);
  elemento('dato-documento').textContent = r.documentoVersionId;
  elemento('dato-establecimiento').textContent = r.establecimiento;
  elemento('dato-autor').textContent = r.autor;
  elemento('dato-fecha').textContent = new Date(Number(r.fecha) * 1000).toLocaleString('es-PE');
  elemento('dato-hash').textContent = r.hashDocumento;
  elemento('resultado').hidden = false;
  mostrarEstado(`Registro ${id} consultado correctamente.`, 'exito');
}

// 5. INICIO: configurar la lectura pública y asociar los botones.
async function iniciar() {
  elemento('contrato').textContent = DIRECCION_CONTRATO;
  elemento('contrato').href = `${EXPLORADOR}/address/${DIRECCION_CONTRATO}`;
  if (typeof ethers === 'undefined') {
    mostrarEstado('No se pudo cargar ethers desde internet. Recarga la página con conexión.', 'error');
    for (const id of ['conectar', 'actualizar', 'consultar', 'registrar']) elemento(id).disabled = true;
    return;
  }
  contratoLectura = new ethers.Contract(DIRECCION_CONTRATO, ABI_CONTRATO,
    new ethers.JsonRpcProvider(RPC_LECTURA, Number(RED_SEPOLIA)));
  elemento('conectar').addEventListener('click', () => ejecutar(conectar));
  elemento('actualizar').addEventListener('click', () => ejecutar(async () => {
    mostrarEstado('Actualizando el contador…');
    await actualizarResumen();
    mostrarEstado('Contador actualizado.', 'exito');
  }));
  elemento('form-registro').addEventListener('submit', (e) => { e.preventDefault(); ejecutar(registrar); });
  elemento('form-consulta').addEventListener('submit', (e) => { e.preventDefault(); ejecutar(consultar); });
  await ejecutar(async () => {
    await actualizarResumen();
    mostrarEstado('Consulta pública disponible. Conecta MetaMask para registrar.', 'exito');
  });
}

iniciar();
