// ABRIR FORMULARIO DE REGISTRO DE ROL
function ModalRegistroRol() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_rol").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_rol").modal('show'); 
}

// INICIALIZAR SELECT
$(document).ready(function () {
    $('.js-example-basic-single').select2();
});

//LISTAR ROL
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

var tbl_rol;
function listar_roles() {
    tbl_rol = $("#tabla_rol").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_roles/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "rol" },
            { "data": "fecha_registro" },
            {
                "data": "estatus",
                "render": function (data, type, row) {
                    return data === 'ACTIVO'
                        ? '<span class="badge bg-success">ACTIVO</span>'
                        : '<span class="badge bg-danger">INACTIVO</span>';
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>" 
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

    tbl_rol.on('draw.dt', function () {
        var PageInfo = $("#tabla_rol").DataTable().page.info();
        tbl_rol.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//Limpiar Campos
function limpiar_modal_rol() {
    document.getElementById('txt_rol').value = ""
}

//Validar Campos Vacíos
function validarInput(rol_nombre) {
    Boolean(document.getElementById(rol_nombre).value.length > 0) ? $("#" + rol_nombre).
        removeClass("is-invalid").addClass("is-valid") : $("#" + rol_nombre).addClass("is-invalid")
}
    

//Registrar Rol
function registrar_rol() {
    var rol_nombre = document.getElementById('txt_rol').value;

    if (!rol_nombre) {
        Swal.fire("Error", "El campo Rol no puede estar vacío.", "error");
        validarInput("txt_rol")
        return;
    }

    fetch('/registrar_rol/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ rol_nombre: rol_nombre })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_rol()
            Swal.fire("Registro Exitoso", data.message, "success")
                .then(() => {
                    $('#modal_registro_rol').modal('hide');
                    tbl_rol.ajax.reload();
                });
        } else {
            Swal.fire("Error", `No se pudo registrar el rol: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}

//Modificar Rol
function cargarEstatusSelect(estatusActual) {
    var select = $("#select_estatus_editar");
    select.empty(); 

    fetch('/obtener_estatus/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            var estatusOptions = data.data;
            estatusOptions.forEach(function(option) {
                select.append(new Option(option.text, option.value));
            });

            select.val(estatusActual).trigger('change');
        } else {
            console.error("Error al obtener estatus: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Modificar Rol
$('#tabla_rol').on('click', '.editar', function () {
    var data = tbl_rol.row($(this).parents('tr')).data();

    if (tbl_rol.row(this).child.isShown()) {
        data = tbl_rol.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    $("#txt_idrol_editar").val(data.rol_id);
    $("#txt_rol_editar").val(data.rol);

    cargarEstatusSelect(data.estatus);

    $("#modal_editar_rol").modal({ backdrop: 'static', keyboard: false });
    $("#modal_editar_rol").modal('show');
});

function modificar_rol() {
    var id = $("#txt_idrol_editar").val();
    var rol_nombre = $("#txt_rol_editar").val();
    var estatus = $("#select_estatus_editar").val();

    if (!rol_nombre) {
        Swal.fire("Error", "El campo Rol no puede estar vacío.", "error");
        validarInput("txt_rol_editar")
        return;
    }

    fetch('/modificar_rol/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ rol_id: id, rol_nombre: rol_nombre, rol_estatus: estatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Modificación Exitosa", data.message, "success")
                .then(() => {
                    $('#modal_editar_rol').modal('hide');
                    tbl_rol.ajax.reload(); 
                });
        } else {
            Swal.fire("Error", `No se pudo modificar el rol: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}


