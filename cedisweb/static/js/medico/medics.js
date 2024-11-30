// ABRIR FORMULARIO DE REGISTRO DE MEDICOS
function ModalRegistroMedico() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    cargarEspecialidadesSelect('select_especialidad')
    cargar_select_rol('select_rol')
    document.getElementById('div_mensaje_error').innerHTML = '';
    $("#modal_registro_medico").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_medico").modal('show');
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

// CARGAR ROLES
function cargar_select_rol(selectElementId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/cargar_roles_medico/',
            type: 'POST',
            headers: { "X-CSRFToken": getCookie('csrftoken') },
        }).done(function (resp) {
            if (resp.roles) {
                var select = $('#' + selectElementId);
                select.empty();
                $.each(resp.roles, function (index, role) {
                    select.append($('<option>', {
                        value: role.rol_id,
                        text: role.rol_nombre
                    }));
                });
                resolve();
            } else {
                alert('Error al cargar los roles');
                reject();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al realizar la solicitud AJAX:", textStatus, errorThrown);
            alert('Error al cargar los roles');
            reject();
        });
    });
}

//LISTAR MEDICOS
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
            { "data": "medico_movil" },
            { "data": "medico_direccion" },
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

    tbl_medicos.on('draw.dt', function () {
        var PageInfo = $("#tabla_medicos").DataTable().page.info();
        tbl_medicos.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//LIMPIAR MODAL
function limpiar_modal_medico() {
    document.getElementById('txt_ci').value = "";
    document.getElementById('txt_nombres').value = "";
    document.getElementById('txt_apepat').value = "";
    document.getElementById('txt_apemat').value = "";
    document.getElementById('txt_dir').value = "";
    document.getElementById('txt_tlf').value = "";
    document.getElementById('txt_fechanac').value = "";
    document.getElementById('txt_usuario').value = "";
    document.getElementById('txt_contra').value = "";
    document.getElementById('txt_email').value = "";
    document.getElementById('txt_foto').value = "";

    const campos = ['txt_ci', 'txt_nombres', 'txt_apepat', 'txt_apemat', 'txt_dir', 'txt_tlf', 'txt_fechanac', 'txt_usuario', 'txt_contra', 'txt_email', 'select_rol', 'select_especialidad'];
    campos.forEach(campoId => {
        $("#" + campoId).removeClass("is-valid").removeClass("is-invalid");
    });

    document.getElementById('div_mensaje_error').innerHTML = '';
    document.getElementById('div_mensaje_error_editar').innerHTML = '';
}

//VALIDACIONES//
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

function validarNombreApellido(valor) {
    const regex = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$/;
    return { valido: regex.test(valor), mensaje: "Los campos de nombre y los apellidos solo deben contener letras." };
}

function validarUsuario(usuario) {
    const regex = /^[a-zA-Z0-9_@.-]+$/;
    return { valido: regex.test(usuario), mensaje: "El nombre de usuario solo debe contener letras, números, y los caracteres especiales _ @ . -" };
}

function validarSelect(selectId, tipo) {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        const valor = selectElement.value.trim();
        const mensaje = tipo === 'rol' ? 'Debe seleccionar un rol.' : 'Debe seleccionar una especialidad.';
        return { valido: valor !== '', mensaje: mensaje };
    }
    return { valido: false, mensaje: tipo === 'rol' ? 'Debe seleccionar un rol.' : 'Debe seleccionar una especialidad.' };
}

function validarContrasena(contrasena) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return { valido: regex.test(contrasena), mensaje: "La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número." };
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { valido: regex.test(email), mensaje: "El formato del email es incorrecto." };
}

function validarFoto(fotoInputId) {
    const fileInput = document.getElementById(fotoInputId);
    const file = fileInput.files[0];

    if (file) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            return { valido: false, mensaje: "El archivo seleccionado no es una foto válida. Solo se permiten archivos JPEG, PNG y GIF." };
        }
    }

    return { valido: true, mensaje: "" };
}

function validarCampos() {
    let camposVacios = false;
    const errores = [];
    const nombreApellidoErrores = [];

    const validarCampoYAgregarClase = (campoId, validarFn) => {
        const campo = document.getElementById(campoId);
        if (campoId !== 'txt_foto' && campoId !== 'select_especialidad' && campoId !== 'select_rol' && campo) { 
            const valor = campo.value.trim();
            if (valor.length === 0) {
                camposVacios = true;
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                const resultado = validarFn(valor);
                if (!resultado.valido) {
                    $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
                    if (campoId === 'txt_nombres' || campoId === 'txt_apepat' || campoId === 'txt_apemat') {
                        nombreApellidoErrores.push(resultado.mensaje);
                    } else {
                        errores.push(resultado.mensaje);
                    }
                } else {
                    $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
                }
            }
        } else if (campoId === 'txt_foto' || campoId === 'select_especialidad' || campoId === 'select_rol') {
            const resultado = validarFn(campoId);
            if (!resultado.valido) {
                errores.push(resultado.mensaje);
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        }
    };

    validarCampoYAgregarClase('txt_ci', validarCedula);
    validarCampoYAgregarClase('txt_tlf', validarTelefono);
    validarCampoYAgregarClase('txt_fechanac', validarFecha);
    validarCampoYAgregarClase('txt_nombres', validarNombreApellido);
    validarCampoYAgregarClase('txt_apepat', validarNombreApellido);
    validarCampoYAgregarClase('txt_apemat', validarNombreApellido);
    validarCampoYAgregarClase('txt_dir', valor => ({ valido: valor.length > 0, mensaje: "El campo de la dirección es obligatorio." }));
    validarCampoYAgregarClase('txt_usuario', validarUsuario);
    validarCampoYAgregarClase('txt_contra', validarContrasena);
    validarCampoYAgregarClase('txt_email', validarEmail);
    validarCampoYAgregarClase('select_especialidad', validarSelect);
    validarCampoYAgregarClase('select_rol', validarSelect);
    validarCampoYAgregarClase('txt_foto', validarFoto);

    if (camposVacios) {
        document.getElementById('div_mensaje_error').innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Todos los campos son obligatorios.</h5></div>';
        return false;
    }

    if (nombreApellidoErrores.length > 0) {
        errores.push("Los campos de nombre y los apellidos solo pueden incluir letras.");
    }

    if (errores.length > 0) {
        document.getElementById('div_mensaje_error').innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Error de Validación</h5>' + errores.join("<br>") + '</div>';
        return false;
    }

    return true;
}

function marcarCamposExistentes(message) {
    if (message.includes("La cédula ya está registrada")) {
        $("#txt_ci").addClass("is-invalid");
    }
    if (message.includes("El nombre de usuario ya está registrado")) {
        $("#txt_usuario").addClass("is-invalid");
    }
}
//VALIDACIONES//

//REGISTRAR MEDICO
function registrar_medico() {
    if (!validarCampos()) {
        return;
    }

    const medicoData = new FormData();
    medicoData.append('cedula', document.getElementById('txt_ci').value.trim());
    medicoData.append('nombres', document.getElementById('txt_nombres').value.trim());
    medicoData.append('apepat', document.getElementById('txt_apepat').value.trim());
    medicoData.append('apemat', document.getElementById('txt_apemat').value.trim());
    medicoData.append('telefono', document.getElementById('txt_tlf').value.trim());
    medicoData.append('fecha_nacimiento', document.getElementById('txt_fechanac').value.trim());
    medicoData.append('especialidad_id', document.getElementById('select_especialidad').value.trim());
    medicoData.append('direccion', document.getElementById('txt_dir').value.trim());
    medicoData.append('usuario', document.getElementById('txt_usuario').value.trim());
    medicoData.append('contrasena', document.getElementById('txt_contra').value.trim());
    medicoData.append('email', document.getElementById('txt_email').value.trim());
    medicoData.append('rol_id', document.getElementById('select_rol').value.trim());
    medicoData.append('foto', document.getElementById('txt_foto').files[0]);

    fetch('/registrar_medico/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: medicoData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_medico();
            Swal.fire("Modificación Exitosa", data.message, "success").then((value) => {
                $('#modal_registro_medico').modal('hide');
                tbl_medicos.ajax.reload();
            });
        } else if (data.status === 'error') {
            marcarCamposExistentes(data.message);
            document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Mensaje de Error</h5>' + data.message + '</div>';
        }
    })
    .catch(error => {
        document.getElementById('div_mensaje_error').innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Error</h5>' + 'Error: ' + error + '</div>';
    });
}

//MODAL MODIFICAR MEDICO
$('#tabla_medicos').on('click', '.editar', function () {
    var data = tbl_medicos.row($(this).parents('tr')).data();

    if (tbl_medicos.row(this).child.isShown()) {
        data = tbl_medicos.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid");

    var medico_id = data.medico_id;

    fetch(`/obtener_medico/?id=${medico_id}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            $("#txt_ci_editar").val(data.medico_nrodocumento);
            $("#txt_nombres_editar").val(data.medico_nombre);
            $("#txt_apepat_editar").val(data.medico_apepat);
            $("#txt_apemat_editar").val(data.medico_apemat);
            $("#txt_tlf_editar").val(data.medico_movil);
            $("#txt_fechanac_editar").val(data.medico_fenac);
            $("#txt_dir_editar").val(data.medico_direccion);

            var especialidadActual = data.especialidad_id;
            cargarEspecialidadesSelect('select_especialidad_editar', especialidadActual);
            document.getElementById('div_mensaje_error_editar').innerHTML = '';

            $("#txt_ci_editar").attr("data-id", medico_id);
        }
    })
    .catch(error => console.error('Error:', error));
    $('#modal_editar_medico').modal('show');
    $('#modal_editar_medico').modal({ backdrop: 'static', keyboard: false });
});

//MODIFICAR MEDICO
function modificar_medico() {
    const ids = {
        ci: 'txt_ci_editar',
        nombres: 'txt_nombres_editar',
        apepat: 'txt_apepat_editar',
        apemat: 'txt_apemat_editar',
        telefono: 'txt_tlf_editar',
        fecha_nacimiento: 'txt_fechanac_editar',
        direccion: 'txt_dir_editar',
        especialidad: 'select_especialidad_editar'
    };

    if (!validarInput(ids, 'div_mensaje_error_editar')) {
        return;
    }

    const medico_id = $("#txt_ci_editar").attr("data-id");
    const medicoData = {
        medico_id: medico_id,
        medico_nrodocumento: document.getElementById('txt_ci_editar').value.trim(),
        medico_nombre: document.getElementById('txt_nombres_editar').value.trim(),
        medico_apepat: document.getElementById('txt_apepat_editar').value.trim(),
        medico_apemat: document.getElementById('txt_apemat_editar').value.trim(),
        medico_movil: document.getElementById('txt_tlf_editar').value.trim(),
        medico_fenac: document.getElementById('txt_fechanac_editar').value.trim(),
        medico_direccion: document.getElementById('txt_dir_editar').value.trim(),
        especialidad_id: document.getElementById('select_especialidad_editar').value.trim()
    };


    fetch(`/modificar_medico/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(medicoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_medico()
            Swal.fire("Modificación Exitosa", data.message, "success").then((value) => {
            $('#modal_editar_medico').modal('hide');
            tbl_medicos.ajax.reload();
        });
        } else {
            document.getElementById('div_mensaje_error_editar').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> ' + data.message + '</h5></div>';
        }
    })
    .catch(error => console.error('Error:', error));
}

//VALIDACION MODIFICAR MEDICO
function validarInput(ids, mensajeErrorId) {
    const { ci, nombres, apepat, apemat, direccion, telefono, fecha_nacimiento } = ids;
    let errores = [];
    let camposVacios = false;
    let nombreApellidoErrores = [];

    const validarCampoYAgregarError = (campoId, validarFn) => {
        const valor = document.getElementById(campoId).value.trim();
        if (valor.length === 0) {
            camposVacios = true;
            $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
        } else {
            const resultado = validarFn(valor);
            if (!resultado.valido) {
                if (campoId === nombres || campoId === apepat || campoId === apemat) {
                    nombreApellidoErrores.push(resultado.mensaje);
                } else {
                    errores.push(resultado.mensaje);
                }
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        }
    };

    validarCampoYAgregarError(ci, validarCedula);
    validarCampoYAgregarError(telefono, validarTelefono);
    validarCampoYAgregarError(fecha_nacimiento, validarFecha);
    validarCampoYAgregarError(nombres, validarNombreApellido);
    validarCampoYAgregarError(apepat, validarNombreApellido);
    validarCampoYAgregarError(apemat, validarNombreApellido);
    validarCampoYAgregarError(direccion, valor => ({
        valido: valor.length > 0,
        mensaje: "El campo de la dirección es obligatorio."
    }));

    if (camposVacios) {
        document.getElementById(mensajeErrorId).innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Todos los campos son obligatorios.</h5></div>';
        return false;
    }

    if (nombreApellidoErrores.length > 0) {
        errores.push("Los campos de nombre y los apellidos solo pueden incluir letras.");
    }

    if (errores.length > 0) {
        document.getElementById(mensajeErrorId).innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Error de Validación</h5>' + errores.join("<br>") + '</div>';
        return false;
    }
    return true;
}



