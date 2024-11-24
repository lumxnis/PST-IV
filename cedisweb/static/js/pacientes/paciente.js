//ABRIR FORMULARIO DE REGISTRO DE PACIENTES
function ModalRegistroPaciente() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    cargarSexo();
    $("#modal_registro_paciente").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_paciente").modal('show');
}

$('#modal_registro_paciente').on('hidden.bs.modal', function () {
    document.getElementById('div_mensaje_error').innerHTML = '';
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
});


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
        "serverSide": true,  
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

// VALIDACIONES
function validarCedula(ci) {
    const regex = /^\d{8,10}$/;
    return { valido: regex.test(ci), mensaje: "El campo de la cédula debe contener entre 8 y 10 dígitos numéricos." };
}

function validarTelefono(tlf) {
    const regex = /^\+58\d{10}$/;
    return { valido: regex.test(tlf), mensaje: "El formato del número de teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos." };
}

function validarFecha(fecha) {
    return { valido: fecha.length > 0, mensaje: "El campo de la fecha de nacimiento es obligatorio." };
}

function validarNombre(valor) {
    const regex = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$/;
    return { valido: regex.test(valor), mensaje: "El campo Nombre solo debe contener letras." };
}

function validarApellido(valor) {
    const regex = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$/;
    return { valido: regex.test(valor), mensaje: "El campo Apellido solo debe contener letras." };
}

function validarInput(ci, nombre, apepat, apemat, tlf, fechaNacimiento, mensajeErrorId) {
    let camposVacios = false;
    const mensajeErrorDiv = document.getElementById(mensajeErrorId);

    const validarCampoYAgregarClase = (campoId, validarFn) => {
        const campo = document.getElementById(campoId);
        if (campo) {
            const valor = campo.value.trim();
            if (valor.length === 0) {
                camposVacios = true;
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                const resultado = validarFn(valor);
                if (!resultado.valido) {
                    $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
                } else {
                    $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
                }
            }
        }
    };

    validarCampoYAgregarClase(ci, validarCedula);
    validarCampoYAgregarClase(nombre, validarNombre);
    validarCampoYAgregarClase(apepat, validarApellido);
    validarCampoYAgregarClase(apemat, validarApellido);
    validarCampoYAgregarClase(tlf, validarTelefono);
    validarCampoYAgregarClase(fechaNacimiento, validarFecha);

    if (camposVacios) {
        if (mensajeErrorDiv) {
            mensajeErrorDiv.innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Todos los campos son obligatorios.</h5></div>';
        }
        return false;
    }

    return true;
}
// VALIDACIONES

//Registrar Paciente
function registrar_paciente() {
    const ci = document.getElementById("txt_ci").value.trim();
    const nombres = document.getElementById("txt_nombres").value.trim();
    const apepat = document.getElementById("txt_apepat").value.trim();
    const apemat = document.getElementById("txt_apemat").value.trim();
    const telefono = document.getElementById("txt_tlf").value.trim();
    const fecha_nacimiento = document.getElementById("txt_fecha_nacimiento").value.trim();
    const sexo = document.getElementById("select_sexo").value.trim();

    validarInput("txt_ci", "txt_nombres", "txt_apepat", "txt_apemat", "txt_tlf", "txt_fecha_nacimiento");

    $.ajax({
        url: '/registrar_paciente/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: JSON.stringify({
            ci: ci,
            nombres: nombres,
            apepat: apepat,
            apemat: apemat,
            tlf: telefono,
            fecha_nacimiento: fecha_nacimiento,
            sexo: sexo
        }),
        contentType: 'application/json',
        success: function(response) {
            if (response.status === 'success') {
                Swal.fire("Registro Exitoso", response.message, "success");
                $('#modal_registro_paciente').modal('hide');
                tbl_pacientes.ajax.reload(); 
                limpiar_modal_paciente();
                document.getElementById('div_mensaje_error').innerHTML = '';
            } else {
                if (response.message.includes("La cédula debe contener")) {
                    $("#txt_ci").addClass("is-invalid");
                }
                if (response.message.includes("El campo de nombres solo debe contener letras")) {
                    $("#txt_nombres").addClass("is-invalid");
                }
                if (response.message.includes("El campo de apellido paterno solo debe contener letras")) {
                    $("#txt_apepat").addClass("is-invalid");
                }
                if (response.message.includes("El campo de apellido materno solo debe contener letras")) {
                    $("#txt_apemat").addClass("is-invalid");
                }
                if (response.message.includes("El formato del número de teléfono es incorrecto")) {
                    $("#txt_tlf").addClass("is-invalid");
                }
                if (response.message.includes("Ya existe un paciente registrado con esa cédula")) {
                    $("#txt_ci").addClass("is-invalid");
                }
                
                document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + response.message + '</div>';
            }
        },
        error: function(xhr, status, error) {
            document.getElementById('div_mensaje_error').innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Alert!</h5>' +
            'Error al registrar paciente. Por favor, inténtelo de nuevo.</div>';
        }
    });
}













