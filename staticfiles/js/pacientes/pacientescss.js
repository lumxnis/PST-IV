//ABRIR FORMULARIO DE REGISTRO DE PACIENTES
function ModalRegistroPaciente() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_paciente").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_paciente").modal('show');
}

$('#modal_registro_paciente').on('hidden.bs.modal', function () {
    document.getElementById('div_mensaje_error').innerHTML = '';
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
});

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
    $.getJSON('/media/logo.json', function(data) {
        var logoCedis = data.logoCedis;

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
                "url": languageUrl
            },
            "responsive": true,
            "dom": '<"top"B><"second"lf>rt<"bottom"ip>',
            "buttons": [
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> ',
                    titleAttr: 'Exportar a Excel',
                    className: 'btn btn-success',
                    filename: 'pacientes',
                    title: 'Listado de Pacientes',
                    customize: function (xlsx) {
                        var sheet = xlsx.xl.worksheets['sheet1.xml'];
                        var sheetData = $(sheet).find('sheetData');
                        
                        var firstRow = $(sheetData).find('row[r="1"]');
                        var firstCell = $(firstRow).find('c[r="A1"]');

                        var is = $('<is>');
                        var t = $('<t>').text('Listado de Pacientes');
                        is.append(t);

                        $(firstCell).append(is);
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i> ',
                    titleAttr: 'Exportar a PDF',
                    className: 'btn btn-danger',
                    filename: 'pacientes',
                    title: 'Listado de Pacientes',
                    customize: function (doc) {
                        doc.content.splice(0, 1, {
                            text: [
                                { text: 'CEDIS C.A\n', fontSize: 18, alignment: 'center' },
                                { text: 'Listado de Pacientes\n', fontSize: 14, alignment: 'center' },
                                { text: 'Fecha: ' + new Date().toLocaleDateString() + '\n\n', fontSize: 10, alignment: 'center' }
                            ],
                            alignment: 'center'
                        });
                        doc['header'] = function () {
                            return {
                                columns: [
                                    {
                                        image: logoCedis,
                                        width: 100
                                    },
                                    {
                                        alignment: 'right',
                                        text: 'Listado de Pacientes\nCEDIS C.A',
                                        fontSize: 12,
                                        margin: [0, 20]
                                    }
                                ],
                                margin: [10, 10]
                            };
                        };
                        doc['footer'] = function (page, pages) {
                            return {
                                columns: [
                                    {
                                        alignment: 'right',
                                        text: ['Página ', { text: page.toString() }, ' de ', { text: pages.toString() }]
                                    }
                                ],
                                margin: [10, 10]
                            };
                        };
                        doc.defaultStyle.fontSize = 12;
                    }
                },
                {
                    extend: 'print',
                    text: '<i class="fa fa-print"></i> ',
                    titleAttr: 'Imprimir',
                    className: 'btn btn-info',
                    title: 'Listado de Pacientes',
                    customize: function (win) {
                        $(win.document.body)
                            .css('font-size', '12pt')
                            .prepend(
                                '<div style="display: flex; justify-content: space-between;">' +
                                '<div><img src="' + logoCedis + '" style="height: 50px;" /></div>' +
                                '<div style="text-align: right;">' +
                                '<h3>CEDIS C.A</h3>' +
                                '<h4>Listado de Pacientes</h4>' +
                                '<h5>Fecha: ' + new Date().toLocaleDateString() + '</h5>' +
                                '</div></div>'
                            );
                    }
                },
                {
                    extend: 'copyHtml5',
                    text: '<i class="fa fa-copy"></i> ',
                    titleAttr: 'Copiar',
                    className: 'btn btn-copy',
                    title: 'Listado de Pacientes'
                }
            ],
            select: true,
        });

        tbl_pacientes.on('draw.dt', function () {
            var PageInfo = $("#tabla_pacientes").DataTable().page.info();
            tbl_pacientes.column(0, { page: 'current' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1 + PageInfo.start;
            });
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
    document.getElementById('select_sexo').value = "";
}

// VALIDACIONES
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

    validarInput("txt_ci", "txt_nombres", "txt_apepat", "txt_apemat", "txt_tlf", "txt_fecha_nacimiento", "select_sexo");

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
        success: function (response) {
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
                if (response.message.includes("La fecha de nacimiento no puede ser una fecha futura")) {
                    $("#txt_fecha_nacimiento").removeClass("is-valid").addClass("is-invalid");
                } else {
                    $("#txt_fecha_nacimiento").removeClass("is-invalid").addClass("is-valid");
                }

                document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                    '<div class="alert alert-danger alert-dismissible">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                    '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + response.message + '</div>';
            }
        },
        error: function (xhr, status, error) {
            document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Alert!</h5>' +
                'Error al registrar paciente. Por favor, inténtelo de nuevo.</div>';
        }
    });
}

//Modal Modificar Paciente
$('#tabla_pacientes').on('click', '.editar', function () {
    var data = tbl_pacientes.row($(this).parents('tr')).data();

    if (tbl_pacientes.row(this).child.isShown()) {
        data = tbl_pacientes.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    var paciente_id = data.id;

    fetch(`/obtener_paciente/?id=${paciente_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
            } else {
                $("#txt_ci_editar").val(data.paciente_dni);
                $("#txt_nombres_editar").val(data.paciente_nombres);
                $("#txt_apepat_editar").val(data.paciente_apepaterno);
                $("#txt_apemat_editar").val(data.paciente_apematerno);
                $("#txt_tlf_editar").val(data.paciente_celular);
                $("#txt_fecha_nacimiento_editar").val(data.fecha_nacimiento);

                cargarSexo(data.paciente_sexo);
                $("#txt_ci_editar").attr("data-id", paciente_id);
                document.getElementById('div_mensaje_error_editar').innerHTML = '';
            }
        })
        .catch(error => console.error('Error:', error));
    $('#modal_editar_paciente').modal('show');
    $('#modal_editar_paciente').modal({ backdrop: 'static', keyboard: false });
});

//Modificar Paciente
function modificarPaciente() {
    const ci = document.getElementById("txt_ci_editar").value.trim();
    const nombres = document.getElementById("txt_nombres_editar").value.trim();
    const apepat = document.getElementById("txt_apepat_editar").value.trim();
    const apemat = document.getElementById("txt_apemat_editar").value.trim();
    const celular = document.getElementById("txt_tlf_editar").value.trim();
    const fecha_nacimiento = document.getElementById("txt_fecha_nacimiento_editar").value.trim();
    const sexo = document.getElementById("select_sexo_editar").value.trim();

    const id = document.getElementById("txt_ci_editar").getAttribute("data-id")

    validarInput("txt_ci_editar", "txt_nombres_editar", "txt_apepat_editar", "txt_apemat_editar", "txt_tlf_editar", "txt_fecha_nacimiento_editar", "select_sexo_editar", "div_mensaje_error_editar")

    const data = {
        id: id,
        ci: ci,
        nombres: nombres,
        apepat: apepat,
        apemat: apemat,
        celular: celular,
        fecha_nacimiento: fecha_nacimiento,
        sexo: sexo
    };

    $.ajax({
        url: '/modificar_paciente/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire("Modificación Exitosa", response.message, "success");
                $('#modal_editar_paciente').modal('hide');
                tbl_pacientes.ajax.reload();
                limpiar_modal_paciente();
                document.getElementById('div_mensaje_error_editar').innerHTML = '';
            } else {
                if (response.message.includes("La cédula debe contener")) {
                    $("#txt_ci_editar").addClass("is-invalid");
                }
                if (response.message.includes("El campo de nombres solo debe contener letras")) {
                    $("#txt_nombres_editar").addClass("is-invalid");
                }
                if (response.message.includes("El campo de apellido paterno solo debe contener letras")) {
                    $("#txt_apepat_editar").addClass("is-invalid");
                }
                if (response.message.includes("El campo de apellido materno solo debe contener letras")) {
                    $("#txt_apemat_editar").addClass("is-invalid");
                }
                if (response.message.includes("El formato del número de teléfono es incorrecto")) {
                    $("#txt_tlf_editar").addClass("is-invalid");
                }
                if (response.message.includes("Ya existe un paciente registrado con esa cédula")) {
                    $("#txt_ci_editar").addClass("is-invalid");
                }
                if (response.message.includes("La fecha de nacimiento no puede ser una fecha futura")) {
                    $("#txt_fecha_nacimiento_editar").removeClass("is-valid").addClass("is-invalid");
                } else {
                    $("#txt_fecha_nacimiento_editar").removeClass("is-invalid").addClass("is-valid");
                }

                document.getElementById('div_mensaje_error_editar').innerHTML = '<br>' +
                    '<div class="alert alert-danger alert-dismissible">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                    '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + response.message + '</div>';
            }
        },
        error: function (xhr, status, error) {
            document.getElementById('div_mensaje_error_editar').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Alert!</h5>' +
                'Error al modificar paciente. Por favor, inténtelo de nuevo.</div>';
        }
    });
}






















