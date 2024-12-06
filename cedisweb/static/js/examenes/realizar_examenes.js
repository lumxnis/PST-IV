//CARGAR REGISTRO REALIZAR_EXAMEN
function cargar_registro(id, vista) {
    $("#" + id).load(vista); 
}

//LISTAR REALIZAR EXAMENES
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

var tbl_realizarexamenes;
function listar_realizarexamenes() {
    tbl_realizarexamenes = $("#tabla_realizarexamenes").DataTable({
        "pageLength": 10,
        "serverSide": true,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_realizar_examen/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": function(json) {
                if (json.error) {
                    console.error("Error al listar los exámenes a realizar:", json.error);
                    return [];
                }
                return json.data;
            },
            "error": function(xhr, error, code) {
                console.error("Error al listar los exámenes a realizar:", xhr.responseText);
            }
        },
        "columns": [
            { "defaultContent":"" },
            { "data": "username" },
            { "data": "paciente_dni" },
            { "data": "paciente" },
            { "data": "medico" },
            { "data": "realizarexamen_fregistro" },
            {
                "data": "realizarexamen_estatus",
                render: function (data, type, row) {
                    if (data == 'PENDIENTE') {
                        return '<span class="badge bg-danger">PENDIENTE</span>';
                    } else {
                        return '<span class="badge bg-success">FINALIZADO</span>';
                    }
                }
            },
            {
                "data": "realizarexamen_estatus",
                render: function (data, type, row) {
                    if(data == 'PENDIENTE'){
                    return "<button class='editar btn btn-primary btn-sm'><i class='fa fa-edit'></i></button>";
                }else{
                    return "<button class='noeditar btn btn-primary btn-sm'><i class='fa fa-edit'></i></button>";
                    }
                },
            },
        ],
        "language": {
            "url": languageUrl
        },
        "order": [[0, 'asc']],
        "select": true
    });

    tbl_realizarexamenes.on('draw.dt', function () {
        var PageInfo = $("#tabla_realizarexamenes").DataTable().page.info();
        tbl_realizarexamenes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//EDITAR 
$('#tabla_realizarexamenes').on('click', '.editar', function () {
    var data = tbl_realizarexamenes.row($(this).parents('tr')).data()
    
    if (tbl_realizarexamenes.row(this).child.isShown()) {
        var data = tbl_realizarexamenes.row(this).data();
    }
    $("#modal_editar").modal({ backdrop: 'static', keyboard: false })
    $("#modal_editar").modal('show')
    document.getElementById('idrealizarexamen').value=data.id
    listar_ver_detalle(parseInt(data.id))
});

$('#tabla_realizarexamenes').on('click', '.noeditar', function () {
    var data = tbl_realizarexamenes.row($(this).parents('tr')).data()
    
    if (tbl_realizarexamenes.row(this).child.isShown()) {
        var data = tbl_realizarexamenes.row(this).data();
    }
    
    return Swal.fire("Mensaje de Advertencia", "No se puede editar un examen finalizado.", "warning");
});

//LISTAR DETALLE
var tbl_ver_detalle;
function listar_ver_detalle(idrealizar) {
    tbl_ver_detalle = $("#tabla_ver_detalle").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_detalle/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "data": function(d) {
                d.id = idrealizar;
            },
            "dataSrc": function (json) {
                if (json.error) {
                    console.error("Error al listar los detalles:", json.error);
                    return [];
                }
                return json.data;
            },
            "error": function (xhr, error, code) {
                console.error("Error al listar los detalles:", xhr.responseText);
            }
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "analisis_nombre" },
            { "data": "examen_nombre" },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button class='btn btn-danger btn-sm eliminar'><i class='fa fa-trash'></i></button>"
                }
            }
        ],
        "language": {
            "url": languageUrl
        },
        select: true
    });

    tbl_ver_detalle.on('draw.dt', function () {
        var PageInfo = $("#tabla_ver_detalle").DataTable().page.info();
        tbl_ver_detalle.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//ELIMINAR DETALLE
$('#tabla_ver_detalle').on('click', '.eliminar', function () {
    var data = tbl_ver_detalle.row($(this).parents('tr')).data()
    
    if (tbl_ver_detalle.row(this).child.isShown()) {
        var data = tbl_ver_detalle.row(this).data();
    }
Swal.fire({
        title: 'Estás seguro de que desea eliminar el examen '+ data.examen_nombre +'?',
        text: "Una vez realizado esto el examen se quitará del detalle!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Confirmar!"
    }).then((result) => {
        if (result.isConfirmed) {
            Eliminar_Realizar_Examen(parseInt(data.id))
        }
    });
});

//BUSCAR PACIENTE
function Buscar_Paciente() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_ver_paciente").modal({ backdrop: 'static', keyboard: false })
    $("#modal_ver_paciente").modal('show');
    listar_pacientes();
}

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
            { "data": "edad" },  
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button style='font-size:13px;' type='button' class='enviar btn btn-primary'><i class='fa fa-share'></i></button>"; 
                }
            }
        ],
        "language": {
            "url": languageUrl
        },
        select: true
    });

    tbl_pacientes.on('draw.dt', function () {
        var PageInfo = $("#tabla_pacientes").DataTable().page.info();
        tbl_pacientes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });

    $('#tabla_pacientes tbody').on('click', 'tr', function() {
        var data = tbl_pacientes.row(this).data();
        if (tbl_pacientes.row(this).child.isShown()) {
            data = tbl_pacientes.row(this).data();
        }
        if (data) {
            $('#txt_idpaciente').val(data.id);
            $('#txt_ci_pac').val(data.paciente_dni);
            $('#txt_paciente').val(data.paciente);
            $("#modal_ver_paciente").modal('hide');
        }
    })
}

//BUSCAR MEDICO
function Buscar_Medico() {
    $("#modal_ver_medico").modal({ backdrop: 'static', keyboard: false })
    $("#modal_ver_medico").modal('show');
    listar_medicos();
}

var tbl_medicos;
function listar_medicos() {
    tbl_medicos = $("#tabla_medicos").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "ajax": {
            "url": "/listar_medicos/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "medico_nrodocumento" },
            { "data": "especialidad_nombre" },
            { "data": "medico" },
            {
                "data": null,
                "render": function (data, type, row) {
                    return "<button style='font-size:13px;' type='button' class='enviar btn btn-primary'><i class='fa fa-share'></i></button>"
                }
            }
        ],
        "language": {
            "url": languageUrl
        },
        select: true
    });

    tbl_medicos.on('draw.dt', function () {
        var PageInfo = $("#tabla_medicos").DataTable().page.info();
        tbl_medicos.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });

    $('#tabla_medicos tbody').on('click', 'tr', function() {
        var data = tbl_medicos.row(this).data();
        if (tbl_medicos.row(this).child.isShown()) {
            data = tbl_medicos.row(this).data();
        }
        if (data) {
            $('#txt_idmedico').val(data.medico_id);
            $('#txt_ci_med').val(data.medico_nrodocumento);
            $('#txt_medico').val(data.medico);
            $("#modal_ver_medico").modal('hide');
        }
    })
}

// CARGAR ANÁLISIS
function cargarAnalisisSelect(selectorId, analisisActual) {
    var select = $("#" + selectorId);
    select.empty();

    select.append(new Option("Seleccionar Análisis", ""));

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
            analisisOptions.forEach(function(option) {
                select.append(new Option(option.text, option.value));
            });

            if (analisisActual !== null && analisisActual !== undefined) {
                select.val(analisisActual).trigger('change');
            }
        } else {
            console.error("Error al obtener análisis: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// CARGAR EXAMEN
function cargar_select_examen(id) {
    $.ajax({
        url: '/obtener_examenes_por_analisis/',
        type: 'POST',
        data: {
            id: id
        },
        success: function(resp) {
            if (resp.status === 'success' && resp.data.length > 0) {
                let $select = $('#select_examen');
                $select.empty(); 
                $select.append('<option value="">Seleccionar Examen</option>'); 
                $.each(resp.data, function(index, examen) {
                    $select.append('<option value="' + examen[0] + '">' + examen[1] + '</option>');
                });
                $select.prop('disabled', false);
            } else {
                $('#select_examen').empty().append('<option value="">No hay exámenes disponibles</option>');
            }
        },
        error: function(error) {
            console.error('Error en la solicitud AJAX:', error);
            $('#select_examen').empty().append('<option value="">Error al cargar exámenes</option>');
        }
    });
}

//Cargar Sexo
function cargarSexo(sexoActual) {
    var select = $("#select_sexo_editar");
    select.empty();

    fetch('/obtener_sexo/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            var sexoOptions = data.data;
            sexoOptions.forEach(function (option) {
                select.append(new Option(option.text, option.value));
            });
            select.val(sexoActual.toLowerCase());
            select.trigger('change');
        } else {
            console.error("Error al obtener estatus:", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

//CARGAR ESPECIALIDADES EN EL FORMULARIO
function cargarEspecialidadesSelect(selectorId, especialidadActual) {
    var select = $("#" + selectorId);
    select.empty(); 

    fetch('/obtener_especialidades/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            var especialidadesOptions = data.data;
            especialidadesOptions.forEach(function(option) {
                select.append(new Option(option.especialidad_nombre, option.especialidad_id));
            });

            if (especialidadActual !== null && especialidadActual !== undefined) {
                select.val(especialidadActual).trigger('change');
            }
        } else {
            console.error("Error al obtener especialidades: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

//VALIDACIONES AGREGAR EXAMEN//
function verificarid(id) {
    let idverficiar = document.querySelectorAll('#table_examen_r td[for="id"]');
    return [].filter.call(idverficiar, td => td.textContent === id).length === 1;
}

function remove(t) {
    var td = t.parentNode;
    var tr = td.parentNode;
    var table = tr.parentNode;
    table.removeChild(tr);
}
//////////////////////////////

//AGREGAR EXAMEN
function agregar_examen_r() {
    let idexamen = document.getElementById('select_examen').value;
    let examen = $("#select_examen option:selected").text();
    let idanalisis =document.getElementById('select_analisis').value;

    if (idexamen.length == 0) {
        return Swal.fire("Mesaje de Advertencia", "No existe el examen seleccionado", "warning");
    }

    if (verificarid(idexamen)){
        return Swal.fire("Mesaje de Advertencia", "El examen ya fue asignado a la tabla", "warning");
    }

    let datos_agregar = "<tr>";
    datos_agregar+= "<td for='id'>"+idexamen +"</td>";
    datos_agregar+= "<td hidden>"+idanalisis+"</td>";
    datos_agregar+= "<td>"+examen+"</td>";
    datos_agregar+= "<td><button class='btn btn-danger' onclick='remove(this)'><i class='fa fa-trash'></i></button></td>";
    datos_agregar+= "</tr>";
    $('#tbody_table_examen_r').append(datos_agregar);
}

// VALIDACIONES PACIENTE //
function validarCedula(ci) {
    const regex = /^\d{7,10}$/;
    return { valido: regex.test(ci), mensaje: "El campo de la cédula debe contener entre 7 y 10 dígitos numéricos." };
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

function validarSelect(selectId) {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        const valor = selectElement.value.trim();
        return { valido: valor !== '', mensaje: "" };
    }
    return { valido: false, mensaje: "" };
}

function validarInput(ci, nombre, apepat, apemat, tlf, fechaNacimiento, selectSexo, mensajeErrorId) {
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

    const selectSexoResultado = validarSelect(selectSexo);
    if (!selectSexoResultado.valido) {
        camposVacios = true;
        $("#" + selectSexo).removeClass("is-valid").addClass("is-invalid");
    } else {
        $("#" + selectSexo).removeClass("is-invalid").addClass("is-valid");
    }

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
// VALIDACIONES //

//LIMPIAR MODAL REGISTRO PACIENTE
function limpiar_modal_paciente() {
    document.getElementById('txt_ci_paciente').value = "";
    document.getElementById('txt_nombres').value = "";
    document.getElementById('txt_apepat').value = "";
    document.getElementById('txt_apemat').value = "";
    document.getElementById('txt_tlf').value = "";
    document.getElementById('txt_fecha_nacimiento').value = "";
    document.getElementById('select_sexo').value = "";
    document.getElementById('div_mensaje_error').innerHTML = '';
}
//

//Registrar Paciente
function registrar_paciente() {
    const ci = document.getElementById("txt_ci_paciente").value.trim();
    const nombres = document.getElementById("txt_nombres").value.trim();
    const apepat = document.getElementById("txt_apepat").value.trim();
    const apemat = document.getElementById("txt_apemat").value.trim();
    const telefono = document.getElementById("txt_tlf").value.trim();
    const fecha_nacimiento = document.getElementById("txt_fecha_nacimiento").value.trim();
    const sexo = document.getElementById("select_sexo").value.trim();

    validarInput("txt_ci_paciente", "txt_nombres", "txt_apepat", "txt_apemat", "txt_tlf", "txt_fecha_nacimiento", "select_sexo");

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
                $('#modal_ver_paciente').modal('hide');
                tbl_pacientes.ajax.reload(); 
                limpiar_modal_paciente();
                document.getElementById('div_mensaje_error').innerHTML = '';
            } else {
                if (response.message.includes("La cédula debe contener")) {
                    $("#txt_ci_paciente").addClass("is-invalid");
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
                    $("#txt_ci_paciente").addClass("is-invalid");
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

//REGISTRAR REALIZAR EXAMEN
function Registrar_Realizar_Examen() {
    let count = $("#table_examen_r tbody#tbody_table_examen_r tr").length;

    if (count == 0) {
        return Swal.fire("Mensaje de Advertencia", "El detalle de la tabla debe tener como mínimo 1 examen", "warning");
    }

    let idpaciente = document.getElementById('txt_idpaciente').value;
    let idusuario = document.getElementById('txt_idprincipal').value;
    let idmedico = document.getElementById('txt_idmedico').value;

    if (idpaciente.length == 0) {
        return Swal.fire("Mensaje de Advertencia", "Debe seleccionar a un paciente", "warning");
    }
    if (idmedico.length == 0) {
        return Swal.fire("Mensaje de Advertencia", "Debe seleccionar a un médico", "warning");
    }

    $.ajax({
        url: '/realizar_examen_registro/',
        type: 'POST',
        data: JSON.stringify({
            idpaciente: idpaciente,
            idmedico: idmedico,
            idusuario: idusuario
        }),
        contentType: 'application/json',
        success: function(resp) {
            if (resp.status === 'success') {
                Registrar_Realizar_Examen_Detalle(resp.id);
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", xhr.responseJSON.message, "error");
        }
    });
}

//REGISTRAR REALIZAR EXAMEN DETALLE
function Registrar_Realizar_Examen_Detalle(id) {
    let count = 0;
    let arreglo_examen = new Array();
    let arreglo_analisis = new Array();

    $("#table_examen_r tbody#tbody_table_examen_r tr").each(function() {
        let examen = $(this).find('td').eq(0).text().trim();
        let analisis = $(this).find('td').eq(1).text().trim();
        arreglo_examen.push(examen);
        arreglo_analisis.push(analisis);
        count++;
    });

    if (count == 0) {
        return Swal.fire("Mensaje de Advertencia", "El detalle de la tabla debe tener como mínimo 1 examen", "warning");
    }

    let examen = arreglo_examen.toString();
    let analisis = arreglo_analisis.toString();

    $.ajax({
        url: '/realizar_examen_detalle/',
        type: 'POST',
        data: JSON.stringify({
            id: id,
            examen: examen,
            analisis: analisis
        }),
        contentType: 'application/json',
        success: function(resp) {
            if (resp.status === 'success') {
                Swal.fire("Mensaje de Confirmación", resp.message, "success").then((result) => {
                    if (result.value) {
                        traer_notificaciones()
                        cargar_registro("contenido_principal", urlRegistroRealizarExamenes);
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

//ELIMINAR ANALISIS DETALLE
function Eliminar_Realizar_Examen(id) {
    $.ajax({
        url: '/realizar_examen_eliminar/',
        type: 'POST',
        data: JSON.stringify({
            id: id,
        }),
        contentType: 'application/json',
        success: function(resp) {
            if (resp.status === 'success') {
                Swal.fire("Mensaje de Confirmación", "El examen fue quitado del detalle", "success").then((result) => {
                    if (result.value) {
                        tbl_ver_detalle.ajax.reload()
                    }
                })
            }else{
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", xhr.responseJSON.message, "error");
        }
    });
}

//Registrar_Detalle_Editar
function Registrar_Detalle_Editar() {
    let id = document.getElementById('idrealizarexamen').value;
    let idanalisis = document.getElementById('select_analisis').value;
    let idexamen = document.getElementById('select_examen').value;

    if (id.length == 0 || idanalisis.length == 0 || idexamen.length == 0) {
        Swal.fire("Mensaje de Advertencia", "Seleccione un análisis y un examen", "error");
        return;  
    }

    $.ajax({
        url: '/realizar_editar_detalle/',
        type: 'POST',
        headers: { "X-CSRFToken": getCookie('csrftoken') },
        data: JSON.stringify({
            id: id,
            idanalisis: idanalisis,
            idexamen: idexamen
        }),
        contentType: 'application/json',
        success: function(resp) {
            if (resp.status === 'success') {
                if (resp.resultado === 1) {
                    Swal.fire("Mensaje de Confirmación", "El examen fue añadido al detalle correctamente", "success").then((result) => {
                        if (result.value) {
                            tbl_ver_detalle.ajax.reload();
                        }
                    });
                } else {
                    Swal.fire("Mensaje de Error", "El examen ya existe en el detalle", "error");
                }
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        },
        error: function(xhr) {
            Swal.fire("Mensaje de Error", xhr.responseJSON.message, "error");
        }
    });
}

