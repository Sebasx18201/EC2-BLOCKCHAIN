// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RegistroProyecto
/// @notice Prototipo academico de registro de evidencias documentales del MINSA.
/// @dev Usar identificadores ficticios. No almacenar datos personales ni clinicos.
contract RegistroProyecto {

    // 1. VARIABLES DE ESTADO
    address public administrador;
    uint256 public totalRegistros;

    struct Registro {
        string documentoVersionId;
        address autor;
        uint256 fecha;
        string establecimiento;
        bytes32 hashDocumento;
    }

    // El numero de registro comienza en 0. La evidencia es de lectura publica.
    mapping(uint256 => Registro) public registros;

    // 2. EVENTOS
    event RegistroCreado(
        uint256 id,
        string documentoVersionId,
        address autor,
        string establecimiento,
        bytes32 hashDocumento
    );

    // 3. CONTROL DE ACCESO
    modifier soloAdministrador() {
        require(msg.sender == administrador, "No autorizado");
        _;
    }

    // 4. CONSTRUCTOR
    // La cuenta que despliega representa al registrador autorizado del piloto.
    constructor() {
        administrador = msg.sender;
    }

    // 5. FUNCION QUE ESCRIBE
    // El SHA-256 se calcula fuera del contrato y se entrega como bytes32.
    function crearRegistro(
        string memory _documentoVersionId,
        string memory _establecimiento,
        bytes32 _hashDocumento
    ) public soloAdministrador {
        require(
            bytes(_documentoVersionId).length > 0,
            "El ID documental no puede estar vacio"
        );
        require(
            bytes(_establecimiento).length > 0,
            "El establecimiento no puede estar vacio"
        );
        require(
            _hashDocumento != bytes32(0),
            "El hash no puede ser cero"
        );

        uint256 id = totalRegistros;

        registros[id] = Registro({
            documentoVersionId: _documentoVersionId,
            autor: msg.sender,
            fecha: block.timestamp,
            establecimiento: _establecimiento,
            hashDocumento: _hashDocumento
        });

        totalRegistros++;

        emit RegistroCreado(
            id,
            _documentoVersionId,
            msg.sender,
            _establecimiento,
            _hashDocumento
        );
    }

    // 6. FUNCIONES DE LECTURA
    // Una llamada de lectura desde la interfaz no requiere una transaccion.
    function obtenerRegistro(uint256 _id)
        public
        view
        returns (
            string memory documentoVersionId,
            address autor,
            uint256 fecha,
            string memory establecimiento,
            bytes32 hashDocumento
        )
    {
        require(_id < totalRegistros, "Ese registro no existe");

        Registro memory r = registros[_id];

        return (
            r.documentoVersionId,
            r.autor,
            r.fecha,
            r.establecimiento,
            r.hashDocumento
        );
    }

    function obtenerHash(uint256 _id)
        public
        view
        returns (bytes32)
    {
        require(_id < totalRegistros, "Ese registro no existe");

        return registros[_id].hashDocumento;
    }
}