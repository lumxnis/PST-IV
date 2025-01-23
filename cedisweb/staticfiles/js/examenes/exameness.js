// ABRIR FORMULARIO DE REGISTRO DE EXAMENES
function ModalRegistroExamenes() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    cargarAnalisisSelect("select_analisis", null, false);
    $("#modal_registro_examen").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_examen").modal('show');
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

var tbl_examenes;
function listar_examenes() {
    tbl_examenes = $("#tabla_examenes").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_examenes/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "analisis_nombre" },
            { "data": "examen_nombre" },
            { "data": "examen_fregistro" },
            {
                "data": "examen_estatus",
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
            "url": languageUrl
        },
        select: true
    });

    tbl_examenes.on('draw.dt', function () {
        var PageInfo = $("#tabla_examenes").DataTable().page.info();
        tbl_examenes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//CARGAR ANALISIS
function cargarAnalisisSelect(selectorId, analisisActual, esEdicion = false) {
    var select = $("#" + selectorId);
    select.empty();

    fetch('/obtener_analisis/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            var analisisOptions = data.data;
            var analisisEncontrado = false;
            analisisOptions.forEach(function(option) {
                select.append(new Option(option.text, option.value));
                if (analisisActual !== null && analisisActual !== undefined && option.value === analisisActual) {
                    analisisEncontrado = true;
                }
            });

            if (analisisActual !== null && analisisActual !== undefined) {
                if (esEdicion && !analisisEncontrado) {
                    setTimeout(function() {
                        Swal.fire({
                            title: 'Alerta',
                            text: 'El análisis seleccionado está inactivo o no existe.',
                            icon: 'warning',
                            confirmButtonText: 'Entendido'
                        });
                    }, 1000);
                } else {
                    select.val(analisisActual).trigger('change');
                }
            }
        } else {
            console.error("Error al obtener análisis: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


//CARGAR ESTATUS
function cargarEstatusSelect(estatusActual) {
    var select = $("#select_estatus_editar");
    select.empty(); 

    fetch('/cargar_estatus_analisis/', {
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

//Limpiar Campos
function limpiar_modal_examen() {
    document.getElementById('txt_examen').value = ""
}

//Validar Campos Vacíos
function validarInput(examen_nombre) {
    Boolean(document.getElementById(examen_nombre).value.length > 0) ? $("#" + examen_nombre).
        removeClass("is-invalid").addClass("is-valid") : $("#" + examen_nombre).addClass("is-invalid")
}

//REGISTRAR EXAMEN
function registrar_examen() {
    var examen_nombre = document.getElementById('txt_examen').value.trim();
    var analisis_id_id = document.getElementById('select_analisis').value; 

    if (!examen_nombre) {
        Swal.fire("Error", "El campo Examen no puede estar vacío.", "error");
        validarInput("txt_examen")
        return;
    }

    fetch('/registrar_examen/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ examen_nombre: examen_nombre, analisis_id_id: analisis_id_id }) 
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_examen();
            Swal.fire("Registro Exitoso", data.message, "success")
                .then(() => {
                    $('#modal_registro_examen').modal('hide');
                    tbl_examenes.ajax.reload();
                });
        } else {
            Swal.fire("Error", `No se pudo registrar el Examen: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}

//MODIFICAR EXAMEN
$('#tabla_examenes').on('click', '.editar', function () {
    var data = tbl_examenes.row($(this).parents('tr')).data();

    if (tbl_examenes.row(this).child.isShown()) {
        data = tbl_examenes.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    $("#txt_idexamen_editar").val(data.examen_id);
    $("#txt_examen_editar").val(data.examen_nombre);

    var analisisActual = data.analisis_id;
    var estatusActual = data.examen_estatus;

    cargarAnalisisSelect("select_analisis_editar", analisisActual, true);
    cargarEstatusSelect(estatusActual);

    $("#modal_editar_examen").modal({ backdrop: 'static', keyboard: false });
    $("#modal_editar_examen").modal('show');
});

function modificar_examen() {
    var examen_id = $("#txt_idexamen_editar").val();
    var examen_nombre = $("#txt_examen_editar").val().trim();
    var analisis_id = $("#select_analisis_editar").val();
    var examen_estatus = $("#select_estatus_editar").val();

    if (!examen_nombre) {
        Swal.fire("Error", "El campo examen no puede estar vacío.", "error");
        validarInput("txt_examen_editar")
        return;
    }

    fetch('/modificar_examen/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ examen_id: examen_id, examen_nombre: examen_nombre, analisis_id: analisis_id, examen_estatus: examen_estatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Modificación Exitosa", data.message, "success")
                .then(() => {
                    $('#modal_editar_examen').modal('hide');
                    tbl_examenes.ajax.reload(); 
                });
        } else {
            Swal.fire("Error", `No se pudo modificar el examen: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}
