// ABRIR FORMULARIO DE REGISTRO DE ESPECIALIDADES
function ModalRegistroEspecialidad() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_especialidad").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_especialidad").modal('show');
}

//LISTAR ESPECIALIDADES
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

var tbl_especialidades;
function listar_especialidades() {
    tbl_especialidades = $("#tabla_especialidades").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_especialidades/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "especialidad_nombre" },
            { "data": "especialidad_fregistro" },
            {
                "data": "especialidad_estatus",
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

    tbl_especialidades.on('draw.dt', function () {
        var PageInfo = $("#tabla_especialidades").DataTable().page.info();
        tbl_especialidades.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//Validación 
function validarInput(inputId) {
    var inputElement = document.getElementById(inputId);
    if (!inputElement.value) {
        inputElement.classList.add('is-invalid');
    } else {
        inputElement.classList.remove('is-invalid');
    }
}

function limpiar_modal_especialidad() {
    document.getElementById('txt_especialidad').value = '';
    document.getElementById('txt_especialidad').classList.remove('is-invalid');
}

//Registrar Especialidad
function registrar_especialidad() {
    var especialidad_nombre = document.getElementById('txt_especialidad').value;

    if (!especialidad_nombre) {
        Swal.fire("Error", "El campo Especialidad no puede estar vacío.", "error");
        validarInput("txt_especialidad");
        return;
    }

    fetch('/registrar_especialidad/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ especialidad_nombre: especialidad_nombre })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_especialidad();
            Swal.fire("Registro Exitoso", data.message, "success")
                .then(() => {
                    $('#modal_registro_especialidad').modal('hide');
                    tbl_especialidades.ajax.reload();
                });
        } else {
            Swal.fire("Error", `No se pudo registrar la especialidad: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}

//CARGAR ESTATUS
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

// Modificar Especialidad
$('#tabla_especialidades').on('click', '.editar', function () {
    var data = tbl_especialidades.row($(this).parents('tr')).data();

    if (tbl_especialidades.row(this).child.isShown()) {
        data = tbl_especialidades.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    $("#txt_idespecialidad_editar").val(data.especialidad_id);
    $("#txt_especialidad_editar").val(data.especialidad_nombre);

    cargarEstatusSelect(data.especialidad_estatus);

    $("#modal_editar_especialidad").modal({ backdrop: 'static', keyboard: false });
    $("#modal_editar_especialidad").modal('show');
});

function modificar_especialidad() {
    var id = $("#txt_idespecialidad_editar").val();
    var especialidad_nombre = $("#txt_especialidad_editar").val();
    var estatus = $("#select_estatus_editar").val();

    if (!especialidad_nombre) {
        Swal.fire("Error", "El campo Especialidad no puede estar vacío.", "error");
        validarInput("txt_especialidad_editar");
        return;
    }

    fetch('/modificar_especialidad/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ especialidad_id: id, especialidad_nombre: especialidad_nombre, especialidad_estatus: estatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Modificación Exitosa", data.message, "success")
                .then(() => {
                    $('#modal_editar_especialidad').modal('hide');
                    tbl_especialidades.ajax.reload(); 
                });
        } else {
            Swal.fire("Error", `No se pudo modificar la especialidad: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}




