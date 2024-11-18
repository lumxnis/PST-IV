//ABRI FORMULARIO DE REGISTRO
function ModalRegistroUsuarios() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_usuario").modal({ backdrop: 'static', keyboard: false });
    cargar_select_rol('select_rol').then(() => {
        $("#modal_registro_usuario").modal('show'); 
    }).catch(() =>{ 
        alert('No se pudo cargar los roles correctamente.');
});
}


// INICIALIZAR SELECT
$(document).ready(function () {
    $('.js-example-basic-single').select2();
});


//LISTAR USUARIOS
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

var tbl_usuario;
function listar_usuarios() {
    tbl_usuario = $("#tabla_usuario").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "serverSide": true,
        "ajax": {
            "url": "/listar_usuarios/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "username" },
            { "data": "email" },
            { "data": "rol_nombre" },
            {
                "data": "picture",
                render: function (data, type, row) {
                    return '<img class="img-responsive" style="width:40px" src="/media/' + data + '">';
                }
            },
            {
                "data": "usu_status",
                render: function (data, type, row) {
                    if (data === 'ACTIVO') {
                        return '<span class="badge bg-success">ACTIVO</span>';
                    } else {
                        return '<span class="badge bg-danger">INACTIVO</span>';
                    }
                }
            },
            {
                "data": "usu_status",
                "render": function (data, type, row) {
                    if(data=='ACTIVO'){
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>&nbsp;<button class='btn btn-success btn-sm disabled'><i class='fa fa-check-circle'></i></button>&nbsp;<button class='desactivar btn btn-danger btn-sm'><i class='fa fa-trash'></i></button>&nbsp;<button class='contra btn btn-secondary btn-sm'><i class='fa fa-key'></i></button>"
                    }else{
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>&nbsp;<button class='activar btn btn-success btn-sm'><i class='fa fa-check-circle'></i></button>&nbsp;<button class='btn btn-danger btn-sm disabled'><i class='fa fa-trash'></i></button>&nbsp;<button class='contra btn btn-secondary btn-sm'><i class='fa fa-key'></i></button>"
                    }
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
    tbl_usuario.on('draw.dt', function () {
        var PageInfo = $("#tabla_usuario").DataTable().page.info();
        tbl_usuario.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}


//Modal Editar Usuario
$(document).ready(function () {
    $('#tabla_usuario').on('click', '.editar', function () {
        var data = tbl_usuario.row($(this).parents('tr')).data();

        if (tbl_usuario.row(this).child.isShown()) {
            data = tbl_usuario.row(this).data();
        }

        cargar_select_rol('select_rol_editar').then(() => {
            $("#select_rol_editar option").each(function () {
                if ($(this).text() === data.rol_nombre) {
                    $(this).prop("selected", true);
                }
            });
            $("#select_rol_editar").trigger('change');
            $(".form-control").removeClass("is-invalid").removeClass("is-valid");
            $("#modal_editar_usuario").modal({ backdrop: 'static', keyboard: false });
            $("#modal_editar_usuario").modal('show');
        }).catch(() => {
            alert('No se pudo cargar los roles correctamente.');
        });
        document.getElementById('txt_idusuario_editar').value = data.id;
        document.getElementById('txt_usuario_editar').value = data.username;
        document.getElementById('txt_email_editar').value = data.email;
    });
});

//Activar Usuario
$('#tabla_usuario').on('click', '.activar', function () {
    var data = tbl_usuario.row($(this).parents('tr')).data();

    if (tbl_usuario.row(this).child.isShown()) {
        data = tbl_usuario.row(this).data();
    }
    Swal.fire({
        title: 'Estás seguro de cambiar el estatus del usuario '+ data.username +' a activo??',
        text: "Una vez realizado esto el usuario tendrá acceso al sistema!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Confirmar!"
    }).then((result) => {
        if (result.isConfirmed) {
            Modificar_Estatus(data.id, "ACTIVO")
        }
    });
})


//Desactivar Usuario
$('#tabla_usuario').on('click', '.desactivar', function () {
    var data = tbl_usuario.row($(this).parents('tr')).data();

    if (tbl_usuario.row(this).child.isShown()) {
        data = tbl_usuario.row(this).data();
    }
    Swal.fire({
        title: 'Estás seguro de cambiar el estatus del usuario '+ data.username +' a inactivo?',
        text: "Una vez realizado esto el usuario no tendrá acceso al sistema!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Confirmar!"
    }).then((result) => {
        if (result.isConfirmed) {
            Modificar_Estatus(data.id, "INACTIVO")
        }
    });
})


// Cargar Roles
function cargar_select_rol(selectElementId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/cargar_roles/',
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

//Registrar Usuario
function registrar_usuario() {
    let usuario = document.getElementById('txt_usuario').value
    let contra = document.getElementById('txt_contra').value
    let email = document.getElementById('txt_email').value
    let rol = document.getElementById('select_rol').value
    let foto = document.getElementById('txt_foto').value
    if (usuario.length == 0 || contra.length == 0 || email.length == 0 || rol.length == 0) {
        validarInput("txt_usuario", "txt_contra", "txt_email");
        return Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos",
            "warning")
    }

    if (validarEmail(email)) {

    } else {
        return Swal.fire("Mensaje de Advertencia", "El formato del email ingresado es incorrecto",
            "warning")
    }

    let extension = foto.split('.').pop().toLowerCase();
    let = nombrefoto = ""
    let f = new Date()
    if (foto.length > 0) {
        nombrefoto = "IMG" + f.getDate() + "" + (f.getMonth() + 1) + "" + f.getFullYear() + "" +
            f.getHours() + "" + f.getMilliseconds() + "." + extension
    }

    let formData = new FormData()
    let fotoobject = $("#txt_foto")[0].files[0]
    formData.append('u', usuario)
    formData.append('c', contra)
    formData.append('e', email)
    formData.append('r', rol)
    formData.append('nombrefoto', nombrefoto)
    formData.append('foto', fotoobject)
    $.ajax({
        url: '/registrar_usuario/',
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        data: formData,
        contentType: false,
        processData: false,
        success: function (resp) {
            if (resp.success) {
                validarInput("txt_usuario", "txt_contra", "txt_email");
                limpiar_modal_usuario();
                Swal.fire("Mensaje de Éxito", resp.message, "success").
                    then((value) => {
                        $("#modal_registro_usuario").modal('hide');
                        tbl_usuario.ajax.reload();
                    })
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        }
    })
    return false
}

//Validar campos vacíos
function validarInput(usuario, contra, email) {
    Boolean(document.getElementById(usuario).value.length > 0) ? $("#" + usuario).
        removeClass("is-invalid").addClass("is-valid") : $("#" + usuario).addClass("is-invalid")
    if (contra != "") {
        Boolean(document.getElementById(contra).value.length > 0) ? $("#" + contra).
            removeClass("is-invalid").addClass("is-valid") : $("#" + contra).addClass("is-invalid")
    }
    Boolean(document.getElementById(email).value.length > 0) ? $("#" + email).
        removeClass("is-invalid").addClass("is-valid") : $("#" + email).addClass("is-invalid")
}

//Validar campos vacíos Contra
function validarInputContra(contra_nueva, contra_repetir) {
    Boolean(document.getElementById(contra_nueva).value.length > 0) ? $("#" + contra_nueva).
        removeClass("is-invalid").addClass("is-valid") : $("#" + contra_nueva).addClass("is-invalid")

    Boolean(document.getElementById(contra_repetir).value.length > 0) ? $("#" + contra_repetir).
            removeClass("is-invalid").addClass("is-valid") : $("#" + contra_repetir).addClass("is-invalid")
}

//Validar Email
function validarEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

//Limpiar Campos
function limpiar_modal_usuario() {
    document.getElementById('txt_usuario').value = ""
    document.getElementById('txt_contra').value = ""
    document.getElementById('txt_email').value = ""
    document.getElementById('txt_foto').value = ""
}

//Limpiar Campos Contra
function limpiar_modal_contra() {
    document.getElementById('txt_contra_nueva').value = ""
    document.getElementById('txt_contra_repetir').value = ""
}

//Modificar Usuarios
function Modificar_Usuario() {
    let id = document.getElementById('txt_idusuario_editar').value;
    let rol = document.getElementById('select_rol_editar').value;
    let email = document.getElementById('txt_email_editar').value;

    if (id.length == 0 || email.length == 0 || rol.length == 0) {
        validarInput("txt_usuario_editar", "", "txt_email_editar");
        return Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
    }

    if (validarEmail(email)) {
    } else {
        return Swal.fire("Mensaje de Advertencia", "El formato del email ingresado es incorrecto",
            "warning")
    }

    fetch('/modificar_usuario/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            id: id,
            rol: rol,
            email: email
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire("Modificación Exitosa", data.message, "success").
                    then((value) => {
                        $("#modal_editar_usuario").modal('hide');
                        tbl_usuario.ajax.reload();
                    })
            } else {
                Swal.fire("Error", `No se pudieron actualizar los datos: ${data.message}`, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", 'Error: ' + error, "error");
        });
}

//Modificar Estatus
function Modificar_Estatus(id,estatus){
    fetch('/modificar_usuario_estatus/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            id: id,
            estatus : estatus
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire("Estatus Actualizado", data.message, "success").
                    then((value) => {
                        tbl_usuario.ajax.reload();
                    })
            } else {
                Swal.fire("Error", `No se pudo cambiar el estatus: ${data.message}`, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", 'Error: ' + error, "error");
        });
}

//Modificar Contraseña
$('#tabla_usuario').on('click', '.contra', function () {
    var data = tbl_usuario.row($(this).parents('tr')).data();

    if (tbl_usuario.row(this).child.isShown()) {
        data = tbl_usuario.row(this).data();
    }

    $(".form-control").removeClass("is-invalid").removeClass("is-valid")
    $("#modal_editar_contra").modal({ backdrop: 'static', keyboard: false })
    $("#modal_editar_contra").modal('show')
    document.getElementById('idusuariocontra').value=data.id
    document.getElementById('lbl_usuario_contra').innerHTML=data.username

})

function Modificar_Contra_Usuario() {
    var id = document.getElementById('idusuariocontra').value;
    var nueva_contraseña = document.getElementById('txt_contra_nueva').value;
    var repetir_contraseña = document.getElementById('txt_contra_repetir').value;

    if (id.length == 0 || nueva_contraseña.length == 0 || repetir_contraseña.length == 0) {
        validarInputContra("txt_contra_nueva", "txt_contra_repetir")
        return Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
    }

    if (nueva_contraseña !== repetir_contraseña) {
        Swal.fire("Error", "Las contraseñas no coinciden.", "error");
        return;
    }

    fetch('/cambiar_contraseña/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            id: id,
            nueva_contraseña: nueva_contraseña
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            limpiar_modal_contra();
            Swal.fire("Contraseña Actualizada", data.message, "success")
                .then(() => {
                    if (data.message.includes('Redirigiendo')) {
                        window.location.href = '/index/';
                    } else {
                        $('#modal_editar_contra').modal('hide');
                        tbl_usuario.ajax.reload(); 
                    }
                });
        } else {
            Swal.fire("Error", `No se pudo cambiar la contraseña: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}






    









