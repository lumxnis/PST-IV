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
});


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

//VALIDADCIONES
function validarTelefono(tlf) {
    if (tlf.length === 0) {
        return { valido: false, mensaje: "El campo del teléfono es obligatorio." };
    }
    const regex = /^\+58\d{10}$/;
    return { valido: regex.test(tlf), mensaje: "El formato del número de teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos." };
}

function validarCedula(ci) {
    if (ci.length === 0) {
        return { valido: false, mensaje: "El campo de la cédula es obligatorio." };
    }
    const regex = /^\d{8,10}$/;
    return { valido: regex.test(ci), mensaje: "El campo de la cédula debe contener entre 8 y 10 dígitos numéricos." };
}

function validarRIF(rif) {
    if (rif.length === 0) {
        return { valido: false, mensaje: "El campo del RIF es obligatorio." };
    }
    const regex = /^[JGVEP][0-9]{8}[0-9]$/;
    return { valido: regex.test(rif), mensaje: "El formato del RIF es incorrecto. Debe comenzar con J, G, V o E, seguido de 8 dígitos y un dígito verificador." };
}

function validarEmail(email) {
    if (email.length === 0) {
        return { valido: false, mensaje: "El campo del email es obligatorio." };
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return { valido: regex.test(email), mensaje: "El formato del email ingresado es incorrecto." };
}

function validarInput(ci, rif, nombre_prov, apellido_prov, direccion_prov, telefono_prov, email_prov) {
    let errores = [];

    const validarCampoYAgregarError = (campoId, validarFn) => {
        const resultado = validarFn(document.getElementById(campoId).value);
        if (!resultado.valido) {
            errores.push(resultado.mensaje);
            $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
        } else {
            $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
        }
    };

    validarCampoYAgregarError(ci, validarCedula);
    validarCampoYAgregarError(rif, validarRIF);
    validarCampoYAgregarError(nombre_prov, valor => ({
        valido: valor.length > 0,
        mensaje: "El nombre es obligatorio."
    }));
    validarCampoYAgregarError(apellido_prov, valor => ({
        valido: valor.length > 0,
        mensaje: "El apellido es obligatorio."
    }));
    validarCampoYAgregarError(direccion_prov, valor => ({
        valido: valor.length > 0,
        mensaje: "La dirección es obligatoria."
    }));
    validarCampoYAgregarError(telefono_prov, validarTelefono);
    validarCampoYAgregarError(email_prov, validarEmail);

    if (errores.length > 0) {
        Swal.fire("Mensaje de Error", errores.join("<br>"), "error");
        return false;
    }
    return true;
}
//VALIDACIONES

//Registrar Proveedor
function registrar_prov() {
    let ci = document.getElementById('txt_cedula').value;
    let rif = document.getElementById('txt_rif').value;
    let nombre_prov = document.getElementById('txt_nombre').value;
    let apellido_prov = document.getElementById('txt_apellido').value;
    let direccion_prov = document.getElementById('txt_dir').value;
    let telefono_prov = document.getElementById('txt_tlf').value;
    let email_prov = document.getElementById('txt_email').value;

    if (validarInput('txt_cedula', 'txt_rif', 'txt_nombre', 'txt_apellido', 'txt_dir', 'txt_tlf', 'txt_email')) {
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
                    });
                } else {
                    Swal.fire("Mensaje de Error", resp.message, "error");
                }
            }
        });
    }
    return false;
}

//Actualizar Proveedor
function modificar_prov() {
    let ci = document.getElementById('txt_cedula_editar').value;
    let rif = document.getElementById('txt_rif_editar').value;
    let nombre_prov = document.getElementById('txt_nombre_editar').value;
    let apellido_prov = document.getElementById('txt_apellido_editar').value;
    let direccion_prov = document.getElementById('txt_dir_editar').value;
    let telefono_prov = document.getElementById('txt_tlf_editar').value;
    let email_prov = document.getElementById('txt_correo_editar').value;

    if (validarInput('txt_cedula_editar', 'txt_rif_editar', 'txt_nombre_editar', 'txt_apellido_editar', 'txt_dir_editar', 'txt_tlf_editar', 'txt_correo_editar')) {
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
                });
            } else {
                Swal.fire("Error", `No se pudieron actualizar los datos: ${data.message}`, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", 'Error: ' + error, "error");
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



