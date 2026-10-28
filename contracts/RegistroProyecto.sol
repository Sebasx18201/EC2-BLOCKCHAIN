// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RegistroProyecto
/// @notice Contrato base del laboratorio. Cada equipo lo adapta a su propio caso.
/// @dev Busque los comentarios TODO: ahi es donde su equipo debe trabajar.
contract RegistroProyecto {

    // ---------------------------------------------------------------
    // 1. VARIABLES DE ESTADO
    // Lo que el contrato guarda de forma permanente en la blockchain.
    // ---------------------------------------------------------------

    address public administrador;
    uint256 public totalRegistros;

    struct Registro {
        string descripcion;
        address autor;
        uint256 fecha;
    }

    mapping(uint256 => Registro) public registros;

    // TODO: agregue aqui las variables que necesite su caso.

    // ---------------------------------------------------------------
    // 2. EVENTOS
    // Avisan a la interfaz que algo cambio dentro del contrato.
    // ---------------------------------------------------------------

    event RegistroCreado(uint256 id, string descripcion, address autor);

    // TODO: agregue un evento por cada cambio relevante de su caso.

    // ---------------------------------------------------------------
    // 3. CONTROL DE ACCESO
    // Condicion que se verifica antes de ejecutar una funcion.
    // ---------------------------------------------------------------

    modifier soloAdministrador() {
        require(msg.sender == administrador, "No autorizado");
        _;
    }

    // ---------------------------------------------------------------
    // 4. CONSTRUCTOR
    // Se ejecuta una sola vez, en el momento del despliegue.
    // ---------------------------------------------------------------

    constructor() {
        administrador = msg.sender;
    }

    // ---------------------------------------------------------------
    // 5. FUNCION QUE ESCRIBE
    // Cambia el estado del contrato. Cuesta gas y abre la billetera.
    // ---------------------------------------------------------------

    function crearRegistro(string memory _descripcion) public soloAdministrador {
        require(bytes(_descripcion).length > 0, "La descripcion no puede estar vacia");

        registros[totalRegistros] = Registro(_descripcion, msg.sender, block.timestamp);
        emit RegistroCreado(totalRegistros, _descripcion, msg.sender);
        totalRegistros++;
    }

    // TODO: reemplace crearRegistro por la funcion real de su caso.

    // ---------------------------------------------------------------
    // 6. FUNCION QUE SOLO LEE
    // No cambia nada. No cuesta gas ni abre la billetera.
    // ---------------------------------------------------------------

    function obtenerRegistro(uint256 _id)
        public
        view
        returns (string memory, address, uint256)
    {
        require(_id < totalRegistros, "Ese registro no existe");

        Registro memory r = registros[_id];
        return (r.descripcion, r.autor, r.fecha);
    }

    // TODO: agregue las funciones de lectura que necesite su interfaz.
}
