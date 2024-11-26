// ABRIR FORMULARIO DE REGISTRO DE ANÁLISIS
function ModalRegistroAnalisis() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_analisis").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_analisis").modal('show');
}

//LISTAR ANÁLISIS
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

var tbl_analisis;
function listar_analisis() {
    tbl_analisis = $("#tabla_analisis").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_analisis/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "analisis_nombre" },
            { "data": "analisis_fregistro" },
            {
                "data": "analisis_estatus",
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

    tbl_analisis.on('draw.dt', function () {
        var PageInfo = $("#tabla_analisis").DataTable().page.info();
        tbl_analisis.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//Limpiar Campos
function limpiar_modal_analisis() {
    document.getElementById('txt_analisis').value = ""
}

//Validar Campos Vacíos
function validarInput(analisis_nombre) {
    Boolean(document.getElementById(analisis_nombre).value.length > 0) ? $("#" + analisis_nombre).
        removeClass("is-invalid").addClass("is-valid") : $("#" + analisis_nombre).addClass("is-invalid")
}


//Registrar ANÁLISIS
function registrar_analisis() {
    var analisis_nombre = document.getElementById('txt_analisis').value;

    if (!analisis_nombre) {
        Swal.fire("Error", "El campo Análisis no puede estar vacío.", "error");
        validarInput("txt_analisis")
        return;
    }

    fetch('/registrar_analisis/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ analisis_nombre: analisis_nombre })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                limpiar_modal_analisis()
                Swal.fire("Registro Exitoso", data.message, "success")
                    .then(() => {
                        $('#modal_registro_analisis').modal('hide');
                        tbl_analisis.ajax.reload();
                    });
            } else {
                Swal.fire("Error", `No se pudo registrar el Análisis: ${data.message}`, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", 'Error: ' + error, "error");
        });
}

//Modificar ANÁLISIS
function cargarEstatusSelect(estatusActual) {
    var select = $("#select_estatus_editar");
    select.empty();

    fetch('/obtener_estatus_analisis/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                var estatusOptions = data.data;
                estatusOptions.forEach(function (option) {
                    select.append(new Option(option.text, option.value));
                });

                select.val(estatusActual).trigger('change');
            } else {
                console.error("Error al obtener estatus: ", data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}

$('#tabla_analisis').on('click', '.editar', function () {
    var data = tbl_analisis.row($(this).parents('tr')).data();

    if (tbl_analisis.row(this).child.isShown()) {
        data = tbl_analisis.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    $("#txt_idanalisis_editar").val(data.id);
    $("#txt_analisis_editar").val(data.analisis_nombre);

    cargarEstatusSelect(data.analisis_estatus);

    $("#modal_editar_analisis").modal({ backdrop: 'static', keyboard: false });
    $("#modal_editar_analisis").modal('show');
});

function modificar_analisis() {
    var analisis_id = $("#txt_idanalisis_editar").val();
    var analisis_nombre = $("#txt_analisis_editar").val();
    var analisis_estatus = $("#select_estatus_editar").val();

    if (!analisis_nombre) {
        Swal.fire("Error", "El campo análisis no puede estar vacío.", "error");
        validarInput("txt_analisis_editar")
        return;
    }

    fetch('/modificar_analisis/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ analisis_id: analisis_id, analisis_nombre: analisis_nombre, analisis_estatus: analisis_estatus })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire("Modificación Exitosa", data.message, "success")
                    .then(() => {
                        $('#modal_editar_analisis').modal('hide');
                        tbl_analisis.ajax.reload();
                    });
            } else {
                Swal.fire("Error", `No se pudo modificar el análisis: ${data.message}`, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", 'Error: ' + error, "error");
        });
}


