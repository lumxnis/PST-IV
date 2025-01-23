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
                        return '<span class="badge bg-success">ENTREGADO</span>';
                    } else {
                        return '<span class="badge bg-danger">FINALIZADO</span>';
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
            "url": languageUrl
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

//Editar Resultado Detalle
$('#tabla_resultadosexamenes').on('click', '.editar', function () {
    var data = tbl_resultados.row($(this).parents('tr')).data()
    
    if (tbl_resultados.row(this).child.isShown()) {
        var data = tbl_resultados.row(this).data();
    }

    $("#modal_editar_resultado").modal({ backdrop: 'static', keyboard: false })
    $("#modal_editar_resultado").modal('show')
    listar_resultado_editar(parseInt(data.id))
});

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
            "url": languageUrl
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
            "url": languageUrl
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
                if (resp.resultado_id) {
                    let resultado_id = parseInt(resp.resultado_id, 10);
                    guardar_Detalle_Analisis(resultado_id);
                } else {
                    Swal.fire("Mensaje de Error", "No se pudo obtener el ID del resultado.", "error");
                }                
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", JSON.stringify(xhr.responseJSON), "error");
        }
    });
}

// REGISTRAR RESULTADO DETALLE
function guardar_Detalle_Analisis(resultado_id) {
    let detalles = [];

    $("#table_realizarexamen_detalle tbody tr").each(function() {
        let fila = $(this);
        let idrealizarexamen = fila.find('td').eq(0).text().trim();  
        let archivo = fila.find('td').eq(3).find('input[type="file"]').prop('files')[0]; 

        let detalle = {
            idrealizarexamen: idrealizarexamen,
            archivo: archivo
        };

        detalles.push(detalle);
    });

    let formData = new FormData();
    formData.append('resultado_id', resultado_id);
    formData.append('detalles', JSON.stringify(detalles.map(detalle => ({
        idrealizarexamen: detalle.idrealizarexamen,
        archivo: detalle.archivo ? detalle.archivo.name : null  
    }))));

    detalles.forEach((detalle, index) => {
        if (detalle.archivo) {
            formData.append(`archivo_${index}`, detalle.archivo);
        }
    });

    $.ajax({
        url: '/guardar_detalle_analisis/',
        type: 'POST',
        headers: { "X-CSRFToken": getCookie('csrftoken') },
        data: formData,
        processData: false,
        contentType: false,
        success: function(resp) {
            if (resp.status === 'success') {
                Swal.fire("Mensaje de Confirmación", resp.message, "success").then((result) => {
                    if (result.value) {
                        traer_notificaciones()
                        cargar_registro("contenido_principal", urlRegistroResultadoExamenes);
                    }
                });
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", xhr.responseJSON.message, "error");
        }
    });
}

//Listar Resultados a Edtiar
var tbl_resultado_editar;
function listar_resultado_editar(id) {
    tbl_resultado_editar = $("#tabla_detalle_resultado_edit").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_resultados_editar/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "data": {
                id: id
            },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "analisis_nombre" },
            { "data": "examen_nombre" },
            { 
                "data": "resuldetalle_archivo",
                render: function(data, type, row) {
                    return "<a class='btn btn-success btn-sm' href='/serve-file/" + data + "' download><i class='fas fa-file-download'></i></a>";

                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button class='enviar btn btn-primary btn-sm enviar'><i class='fa fa-share'></i></button>";
                }
            }
        ],
        "language": {
            "url": languageUrl
        },
        select: true
    });

    tbl_resultado_editar.on('draw.dt', function () {
        var PageInfo = $("#tabla_detalle_resultado_edit").DataTable().page.info();
        tbl_resultado_editar.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

$(document).ready(function() {
    $('#tabla_detalle_resultado_edit').on('click', '.enviar', function () {
        var data = tbl_resultado_editar.row($(this).parents('tr')).data();
        
        if (tbl_resultado_editar.row(this).child.isShown()) {
            data = tbl_resultado_editar.row(this).data();
        }
        
        document.getElementById('txt_id_detalle').value = data.resultado_detalle_id;
        document.getElementById('btn_actualizar').disabled = false;

        $('#modal_editar_resultado').on('hidden.bs.modal', function () { 
            document.getElementById('btn_actualizar').disabled = true;
            document.getElementById('txt_archivo_editar').value = "";
            document.getElementById('txt_id_detalle').value = "";
        });
    });

    $('#btn_actualizar').on('click', function() {
        var resultadoDetalleId = document.getElementById('txt_id_detalle').value;
        var archivo = document.getElementById('txt_archivo_editar').files[0];

        if(resultadoDetalleId==0){
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor, selecciona un examen.'
            });
            return;
        }

        if (!archivo) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor, selecciona un archivo.'
            });
            return;
        }

        var formData = new FormData();
        formData.append('resultado_detalle_id', resultadoDetalleId);
        formData.append('archivo', archivo);

        $.ajax({
            url: '/actualizar_examen/',
            type: 'POST',
            headers: { "X-CSRFToken": getCookie('csrftoken') },
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Archivo actualizado correctamente'
                });
                document.getElementById('txt_archivo_editar').value = "";
                document.getElementById('txt_id_detalle').value = "";
                tbl_resultado_editar.ajax.reload()
            },
            error: function(error) {
                console.error('Error al actualizar el archivo:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el archivo'
                });
            }
        });
    });
});

