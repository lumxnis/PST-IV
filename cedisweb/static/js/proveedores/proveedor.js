//ABRI FORMULARIO DE REGISTRO
function ModalRegistroProveedores() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_prov").modal({ backdrop: 'static', keyboard: false });
    $("#modal_registro_prov").modal('show'); 
}

////Modal Editar Proveedor
$('#tabla_proveedor').on('click', '.editar', function () {
    var data = tbl_prov.row($(this).parents('tr')).data();

    if (tbl_prov.row(this).child.isShown()) {
        data = tbl_prov.row(this).data();
    }

    $('#txt_cedula_editar').val(data.cedula_prov);
    $('#txt_rif_editar').val(data.rif);
    $('#txt_nombre_editar').val(data.nombre_prov);
    $('#txt_apellido_editar').val(data.apellido_prov);
    $('#txt_dir_editar').val(data.direccion_prov);
    $('#txt_tlf_editar').val(data.telefono_prov);
    $('#txt_correo_editar').val(data.email_prov);

    $('#modal_editar_prov').modal('show');
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_editar_prov").modal({ backdrop: 'static', keyboard: false });

    $('#modal_editar_prov').on('hidden.bs.modal', function () { 
        document.getElementById('div_mensaje_error_editar').innerHTML = ''; 
    });
})



//LISTAR Proveedores
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

var tbl_prov;
function listar_proveedores() {
    tbl_prov = $("#tabla_proveedor").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "serverSide": true,
        "ajax": {
            "url": "/listar_proveedores/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "cedula_prov" },
            { "data": "rif" },
            { "data": "nombre_prov" },
            { "data": "apellido_prov" },
            { "data": "direccion_prov" },
            { "data": "telefono_prov" },
            { "data": "email_prov" },
            { "defaultContent": "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>&nbsp;<button class='eliminar btn btn-danger btn-sm'><i class='fa fa-trash'></i></button>" },
        ],
        "language": {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
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

    tbl_prov.on('draw.dt', function () {
        var PageInfo = $("#tabla_proveedor").DataTable().page.info();
        tbl_prov.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}

//Limpiar Campos
function limpiar_modal_prov() {
    document.getElementById('txt_cedula').value = ""
    document.getElementById('txt_rif').value = ""
    document.getElementById('txt_nombre').value = ""
    document.getElementById('txt_apellido').value = ""
    document.getElementById('txt_dir').value = ""
    document.getElementById('txt_tlf').value = ""
    document.getElementById('txt_email').value = ""
}

//VALIDACIONES//
function validarTelefono(tlf) {
    const regex = /^\+58\d{10}$/;
    return { valido: regex.test(tlf), mensaje: "El formato del número de teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos." };
}

function validarCedula(ci) {
    const regex = /^\d{8,10}$/;
    return { valido: regex.test(ci), mensaje: "El campo de la cédula debe contener entre 8 y 10 dígitos numéricos." };
}

function validarRIF(rif) {
    const regex = /^[JGVEP][0-9]{8}[0-9]$/;
    return { valido: regex.test(rif), mensaje: "El formato del RIF es incorrecto. Debe comenzar con J, G, V o E, seguido de 8 dígitos y un dígito verificador." };
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { valido: regex.test(email), mensaje: "El formato del email ingresado es incorrecto." };
}

function validarNombre(valor) {
    const regex = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$/;
    return { valido: regex.test(valor), mensaje: "El campo Nombre solo debe contener letras." };
}

function validarApellido(valor) {
    const regex = /^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$/;
    return { valido: regex.test(valor), mensaje: "El campo Apellido solo debe contener letras." };
}

function validarInput(ids, mensajeErrorId) {
    const { ci, rif, nombre_prov, apellido_prov, direccion_prov, telefono_prov, email_prov } = ids;
    let errores = [];
    let camposVacios = false;

    const validarCampoYAgregarError = (campoId, validarFn) => {
        const valor = document.getElementById(campoId).value.trim();
        if (valor.length === 0) {
            camposVacios = true;
            $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
        } else {
            const resultado = validarFn(valor);
            if (!resultado.valido) {
                errores.push(resultado.mensaje);
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        }
    };

    validarCampoYAgregarError(ci, validarCedula);
    validarCampoYAgregarError(rif, validarRIF);
    validarCampoYAgregarError(nombre_prov, validarNombre);
    validarCampoYAgregarError(apellido_prov, validarApellido);
    validarCampoYAgregarError(direccion_prov, valor => ({
        valido: valor.length > 0,
        mensaje: "La dirección es obligatoria."
    }));
    validarCampoYAgregarError(telefono_prov, validarTelefono);
    validarCampoYAgregarError(email_prov, validarEmail);

    if (camposVacios) {
        document.getElementById(mensajeErrorId).innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Todos los campos son obligatorios.</h5></div>';
        return false;
    }

    if (errores.length > 0) {
        document.getElementById(mensajeErrorId).innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + errores.join("<br>") + '</div>';
        return false;
    }
    return true;
}

function marcarCamposExistentes(message) {
    if (message.includes("El proveedor con esta cédula ya existe")) {
        $("#txt_cedula").addClass("is-invalid");
    }
    if (message.includes("El proveedor con este email ya existe")) {
        $("#txt_email").addClass("is-invalid");
    }
    if (message.includes("El proveedor con este rif ya existe")) {
        $("#txt_rif").addClass("is-invalid");
    }
}
//VALIDACIONES//

//Registrar Proveedor
function registrar_prov() {
    let ci = document.getElementById('txt_cedula').value.trim();
    let rif = document.getElementById('txt_rif').value.trim();
    let nombre_prov = document.getElementById('txt_nombre').value.trim();
    let apellido_prov = document.getElementById('txt_apellido').value.trim();
    let direccion_prov = document.getElementById('txt_dir').value.trim();
    let telefono_prov = document.getElementById('txt_tlf').value.trim();
    let email_prov = document.getElementById('txt_email').value.trim();

    const ids = {
        ci: 'txt_cedula',
        rif: 'txt_rif',
        nombre_prov: 'txt_nombre',
        apellido_prov: 'txt_apellido',
        direccion_prov: 'txt_dir',
        telefono_prov: 'txt_tlf',
        email_prov: 'txt_email'
    };

    if (validarInput(ids, 'div_mensaje_error')) {
        let formData = new FormData();
        formData.append('c', ci);
        formData.append('r', rif);
        formData.append('n', nombre_prov);
        formData.append('a', apellido_prov);
        formData.append('d', direccion_prov);
        formData.append('t', telefono_prov);
        formData.append('e', email_prov);

        $.ajax({
            url: '/registrar_prov/',
            type: 'POST',
            headers: { "X-CSRFToken": csrftoken },
            data: formData,
            contentType: false,
            processData: false,
            success: function (resp) {
                if (resp.success) {
                    limpiar_modal_prov();
                    Swal.fire("Mensaje de Éxito", resp.message, "success").then((value) => {
                        $("#modal_registro_prov").modal('hide');
                        tbl_prov.ajax.reload();
                        document.getElementById('div_mensaje_error').innerHTML = '';
                    });
                } else {
                    if (resp.message.includes("El proveedor con esta cédula ya existe")) {
                        $("#txt_cedula").addClass("is-invalid");
                    }
                    if (resp.message.includes("El proveedor con este email ya existe")) {
                        $("#txt_email").addClass("is-invalid");
                    }
                    if (resp.message.includes("El proveedor con este rif ya existe")) {
                        $("#txt_rif").addClass("is-invalid");
                    }
                    if (resp.message.includes("El formato del número de teléfono es incorrecto")) {
                        $("#txt_tlf").addClass("is-invalid");
                    }
                    if (resp.message.includes("El formato del RIF es incorrecto")) {
                        $("#txt_rif").addClass("is-invalid");
                    }
                    if (resp.message.includes("El formato del email ingresado es incorrecto")) {
                        $("#txt_email").addClass("is-invalid");
                    }
                    if (resp.message.includes("El campo de la cédula debe contener")) {
                        $("#txt_cedula").addClass("is-invalid");
                    }
                    if (resp.message.includes("El campo de nombres solo debe contener letras.")) {
                        $("#txt_nombre").addClass("is-invalid");
                    }
                    if (resp.message.includes("El campo de apellidos solo debe contener letras.")) {
                        $("#txt_apellido").addClass("is-invalid");
                    }
                    document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                    '<div class="alert alert-danger alert-dismissible">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                    '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + resp.message + '</div>';
                }
            },
            error: function(xhr, status, error) {
                document.getElementById('div_mensaje_error').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Alert!</h5>' +
                'Error al registrar proveedor. Por favor, inténtelo de nuevo.</div>';
            }
        });
    }
    return false;
}

//Actualizar Proveedor
function modificar_prov() {
    let ci = document.getElementById('txt_cedula_editar').value.trim();
    let rif = document.getElementById('txt_rif_editar').value.trim();
    let nombre_prov = document.getElementById('txt_nombre_editar').value.trim();
    let apellido_prov = document.getElementById('txt_apellido_editar').value.trim();
    let direccion_prov = document.getElementById('txt_dir_editar').value.trim();
    let telefono_prov = document.getElementById('txt_tlf_editar').value.trim();
    let email_prov = document.getElementById('txt_correo_editar').value.trim();

    const ids = {
        ci: 'txt_cedula_editar',
        rif: 'txt_rif_editar',
        nombre_prov: 'txt_nombre_editar',
        apellido_prov: 'txt_apellido_editar',
        direccion_prov: 'txt_dir_editar',
        telefono_prov: 'txt_tlf_editar',
        email_prov: 'txt_correo_editar'
    };

    if (validarInput(ids, 'div_mensaje_error_editar')) {
        let formData = new URLSearchParams();
        formData.append('cedula', ci);
        formData.append('rif', rif);
        formData.append('nombre', nombre_prov);
        formData.append('apellido', apellido_prov);
        formData.append('direccion', direccion_prov);
        formData.append('telefono', telefono_prov);
        formData.append('email', email_prov);

        fetch('/modificar_prov/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire("Modificación Exitosa", data.message, "success").then((value) => {
                    $("#modal_editar_prov").modal('hide');
                    tbl_prov.ajax.reload();
                    document.getElementById('div_mensaje_error_editar').innerHTML = '';
                });
            } else {
                // Marcar campos con is-invalid si hay errores
                if (data.message.includes("El proveedor con este rif ya existe")) {
                    $("#txt_rif_editar").addClass("is-invalid");
                }
                if (data.message.includes("El proveedor con este email ya existe")) {
                    $("#txt_correo_editar").addClass("is-invalid");
                }
                if (data.message.includes("El formato del número de teléfono es incorrecto")) {
                    $("#txt_tlf_editar").addClass("is-invalid");
                }
                if (data.message.includes("El formato del RIF es incorrecto")) {
                    $("#txt_rif_editar").addClass("is-invalid");
                }
                if (data.message.includes("El formato del email ingresado es incorrecto")) {
                    $("#txt_correo_editar").addClass("is-invalid");
                }
                if (data.message.includes("El campo de la cédula debe contener")) {
                    $("#txt_cedula_editar").addClass("is-invalid");
                }
                
                document.getElementById('div_mensaje_error_editar').innerHTML = '<br>' +
                '<div class="alert alert-danger alert-dismissible">' +
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                '<h5><i class="icon fas fa-ban"></i> Revise los siguientes campos!</h5>' + data.message + '</div>';
            }
        })
        .catch(error => {
            document.getElementById('div_mensaje_error_editar').innerHTML = '<br>' +
            '<div class="alert alert-danger alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
            '<h5><i class="icon fas fa-ban"></i> Alert!</h5>' +
            'Error al modificar proveedor. Por favor, inténtelo de nuevo.</div>';
        });
    }
    return false;
}

//ELIMINAR PROVEEDOR
$('#tabla_proveedor').on('click', '.eliminar', function () {
    var data = tbl_prov.row($(this).parents('tr')).data();

    if (tbl_prov.row(this).child.isShown()) {
        data = tbl_prov.row(this).data();
    }

    Swal.fire({
        title: '¿Está seguro?',
        text: "¿Desea eliminar al proveedor " + data.nombre_prov + "?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarProveedor(data.cedula_prov);
        }
    });
});

function eliminarProveedor(cedula) {
    fetch('/eliminar_prov/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            cedula: cedula
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Eliminado", data.message, "success").then(() => {
                tbl_prov.ajax.reload();
            });
        } else {
            Swal.fire("Error", `No se pudo eliminar el proveedor: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}



