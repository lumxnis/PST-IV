//ABRIR FORMULARIO DE REGISTRO DE PACIENTES
function ModalRegistroPaciente() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    cargarSexo();
    $("#modal_registro_paciente").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_paciente").modal('show');
}

//CARGAR OPCIONES
function cargarOpcionesSelect(selectorId, opciones) {
    var select = $("#" + selectorId);
    select.empty();
    opciones.forEach(function(option) {
        select.append(new Option(option.text, option.value));
    });
}

function cargarSexo() {
    fetch('/obtener_opciones/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            var sexoOptions = data.sexo;

            cargarOpcionesSelect('select_sexo', sexoOptions);
        } else {
            console.error("Error al obtener opciones: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// INICIALIZAR SELECT
$(document).ready(function () {
    $('.js-example-basic-single').select2();
});

//LISTAR PACIENTES
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

var tbl_pacientes;
function listar_pacientes() {
    tbl_pacientes = $("#tabla_pacientes").DataTable({
        "pageLength": 10,
        "serverSide": true,  // Activar el procesamiento del lado del servidor
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_pacientes/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data",
            "error": function(xhr, error, code) {
                console.error("Error al listar pacientes:", xhr.responseText);
            }
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "paciente_dni" },
            { "data": "paciente" },
            { "data": "paciente_celular" },
            { "data": "edad" },  
            { "data": "paciente_sexo" },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>"; 
                }
            }
        ],
        "language": {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
        select: true
    });

    tbl_pacientes.on('draw.dt', function () {
        var PageInfo = $("#tabla_pacientes").DataTable().page.info();
        tbl_pacientes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}


//LIMPIAR MODAL
function limpiar_modal_paciente() {
    document.getElementById('txt_ci').value = "";
    document.getElementById('txt_nombres').value = "";
    document.getElementById('txt_apepat').value = "";
    document.getElementById('txt_apemat').value = "";
    document.getElementById('txt_tlf').value = "";
    document.getElementById('txt_fecha_nacimiento').value = "";
}

///VALIDACIONES///
function validarTelefono(tlf) {
    if (tlf.length === 0) {
        return { valido: false, mensaje: "El campo del teléfono es obligatorio." };
    }
    const regex = /^\+58\d{10}$/;
    return { valido: regex.test(tlf), mensaje: "El formato del número de teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos." };
}

function validarCedula(ci) {
    if (ci.length === 0) {
        return { valido: false, mensaje: "El campo de la cédula es obligatorio." };
    }
    const regex = /^\d{8,10}$/;
    return { valido: regex.test(ci), mensaje: "El campo de la cédula debe contener entre 8 y 10 dígitos numéricos." };
}

function soloLetras(e) {
    var tecla = e.key.toLowerCase();
    var letras = " áéíóúabcdefghijklmnñopqrstuvwxyz";
    var especiales = ["Backspace", "ArrowLeft", "ArrowRight", "Delete"];

    if (letras.indexOf(tecla) === -1 && !especiales.includes(tecla)) {
        e.preventDefault();  
        return false;  
    }

    return true;
}

document.getElementById('txt_nombres').addEventListener('keypress', soloLetras);
document.getElementById('txt_apepat').addEventListener('keypress', soloLetras);
document.getElementById('txt_apemat').addEventListener('keypress', soloLetras);

function validarFecha(fecha) {
    if (fecha.length === 0) {
        return { valido: false, mensaje: "El campo de la fecha de nacimiento es obligatorio." };
    }
    return { valido: true, mensaje: "" };
}

function validarInput(ci, nombre, apepat, apemat, tlf, fechaNacimiento) {
    let errores = [];

    const validarCampoYAgregarError = (campoId, validarFn) => {
        const campo = document.getElementById(campoId);
        if (campo) {
            const resultado = validarFn(campo.value.trim());
            if (!resultado.valido) {
                errores.push(resultado.mensaje);
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        } else {
            console.log(`El elemento con id ${campoId} no existe.`);
        }
    };

    validarCampoYAgregarError(ci, validarCedula);
    validarCampoYAgregarError(nombre, valor => ({
        valido: valor.length > 0,
        mensaje: "El nombre es obligatorio."
    }));
    validarCampoYAgregarError(apepat, valor => ({
        valido: valor.length > 0,
        mensaje: "El apellido paterno es obligatorio."
    }));
    validarCampoYAgregarError(apemat, valor => ({
        valido: valor.length > 0,
        mensaje: "El apellido materno es obligatorio."
    }));
    validarCampoYAgregarError(tlf, validarTelefono);
    validarCampoYAgregarError(fechaNacimiento, validarFecha);

    if (errores.length > 0) {
        Swal.fire("Mensaje de Error", errores.join("<br>"), "error");
        return false;
    }
    return true;
}
///VALIDACIONES///

//REGISTRAR PACIENTE
function registrar_paciente() {
    const ciElem = document.getElementById('txt_ci');
    const nombresElem = document.getElementById('txt_nombres');
    const apepatElem = document.getElementById('txt_apepat');
    const apematElem = document.getElementById('txt_apemat');
    const tlfElem = document.getElementById('txt_tlf');
    const fechaNacimientoElem = document.getElementById('txt_fecha_nacimiento');
    const sexoElem = document.getElementById('select_sexo');

    if (!ciElem || !nombresElem || !apepatElem || !apematElem || !tlfElem || !fechaNacimientoElem || !sexoElem) {
        console.log('Error: Uno o más elementos del formulario no existen en el DOM.');
        Swal.fire("Error", "Todos los campos son obligatorios.", "error");
        return;
    }

    const ci = ciElem.value.trim();
    const nombres = nombresElem.value.trim();
    const apepat = apepatElem.value.trim();
    const apemat = apematElem.value.trim();
    const tlf = tlfElem.value.trim();
    const fechaNacimiento = fechaNacimientoElem.value.trim();
    const sexo = sexoElem.value.trim();

    if (!validarInput('txt_ci', 'txt_nombres', 'txt_apepat', 'txt_apemat', 'txt_tlf', 'txt_fecha_nacimiento')) {
        return;
    }

    fetch('/registrar_paciente/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            ci: ci,
            nombres: nombres,
            apepat: apepat,
            apemat: apemat,
            tlf: tlf,
            fecha_nacimiento: fechaNacimiento,
            sexo: sexo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_paciente();
            Swal.fire("Registro Exitoso", data.message, "success")
                .then(() => {
                    $('#modal_registro_paciente').modal('hide');
                    tbl_pacientes.ajax.reload();
                });
        } else {
            Swal.fire("Error", `No se pudo registrar el Paciente: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}


