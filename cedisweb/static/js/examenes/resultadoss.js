//
function cargar_registro(id, vista) {
    $("#" + id).load(vista);
}

//LISTAR RESULTADOS EXAMENES
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

var tbl_resultados;
function listar_resultados() {
    tbl_resultados = $("#tabla_resultadosexamenes").DataTable({
        "pageLength": 10,
        "serverSide": true,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_resultado_examen/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": function (json) {
                if (json.error) {
                    console.error("Error al listar los resultados:", json.error);
                    return [];
                }
                return json.data;
            },
            "error": function (xhr, error, code) {
                console.error("Error al listar los resultados:", xhr.responseText);
            }
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "username" },
            { "data": "paciente_dni" },
            { "data": "paciente" },
            { "data": "resultado_fregistro" },
            {
                "data": "resultado_estatus",
                render: function (data, type, row) {
                    if (data === '1') {
                        return '<span class="badge bg-success">FINALIZADO</span>';
                    } else {
                        return '<span class="badge bg-warning">ENTREGADO</span>';
                    }
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button class='btn btn-primary btn-sm editar' data-id='" + row.id + "'><i class='fa fa-edit'></i></button>";
                },
                "orderable": false
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
        "order": [[0, 'asc']],
        "select": true
    });

    tbl_resultados.on('draw.dt', function () {
        var PageInfo = $("#tabla_resultadosexamenes").DataTable().page.info();
        tbl_resultados.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//ABRIR MODAL PACIENTE EXAMENES
function Abrir_Modal_Examenes() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_ver_examenes").modal({ backdrop: 'static', keyboard: false })
    $("#modal_ver_examenes").modal('show');
    listar_realizarexamenes()
}

//LISTAR EXAMENES PENDIENTES
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

var tbl_paciente_examenes;
function listar_realizarexamenes() {
    tbl_paciente_examenes = $("#tabla_resultados_pacientes").DataTable({
        "pageLength": 10,
        "serverSide": true,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_pacientes_examenes/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": function (json) {
                if (json.error) {
                    console.error("Error al listar los exámenes:", json.error);
                    return [];
                }
                return json.data;
            },
            "error": function (xhr, error, code) {
                console.error("Error al listar los exámenes:", xhr.responseText);
            }
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "paciente_dni" },
            { "data": "paciente" },
            { "data": "edad" },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button style='font-size:13px;' type='button' class='enviar btn btn-primary'><i class='fa fa-share'></i></button>";
                },
                "orderable": false
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
        "order": [[0, 'asc']],
        "select": true
    });

    tbl_paciente_examenes.on('draw.dt', function () {
        var PageInfo = $("#tabla_resultados_pacientes").DataTable().page.info();
        tbl_paciente_examenes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });

    $('#tabla_resultados_pacientes tbody').on('click', 'tr', function () {
        var data = tbl_paciente_examenes.row(this).data();
        if (tbl_paciente_examenes.row(this).child.isShown()) {
            data = tbl_paciente_examenes.row(this).data();
        }
        if (data) {
            $('#txt_idexamen').val(data.id);
            $('#txt_ci_pac').val(data.paciente_dni);
            $('#txt_paciente').val(data.paciente);
            $('#txt_ci_med').val(data.medico_nrodocumento);
            $('#txt_medico').val(data.medico);
            $("#modal_ver_examenes").modal('hide');

            listado_Detalle_Analisis(parseInt(data.id))
        }
    })

}

//LISTAR DETALLE 
function listado_Detalle_Analisis(id) {
    var tbl_detalle;
    tbl_detalle = $("#table_realizarexamen_detalle").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "autoWidth": true,
        "ajax": {
            "url": "/realizarexamen_detalle/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "data": {
                idexamen: id
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "analisis_nombre" },
            { "data": "examen_nombre" },
            { "defaultContent": "<input type='file' class='archivo form-control'>" }
        ],
        "columnDefs": [
            { "width": "10%", "targets": 0 },
            { "width": "30%", "targets": 1 },
            { "width": "30%", "targets": 2 },
            { "width": "30%", "targets": 3 }
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
}


//REGISTRAR RESULTADO EXAMEN
function Registrar_Resultado_Examen() {
    let idrealizarexamen = document.getElementById('txt_idexamen').value;
    let idusuario = document.getElementById('txt_idprincipal').value;

    if (idrealizarexamen.length == 0) {
        return Swal.fire("Mensaje de Advertencia", "Debe seleccionar un paciente con exámenes pendientes", "warning");
    }
    $.ajax({
        url: '/realizar_resultado_registro/',
        type: 'POST',
        data: JSON.stringify({
            idrealizarexamen: idrealizarexamen,
            idusuario: idusuario
        }),
        contentType: 'application/json',
        success: function(resp) {
            if (resp.status === 'success') {
                Swal.fire("Mensaje de Éxito", resp.message, "success");
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", JSON.stringify(xhr.responseJSON), "error");
        }
    });
}

//REGISTRAR RESULTADO DETALLE

