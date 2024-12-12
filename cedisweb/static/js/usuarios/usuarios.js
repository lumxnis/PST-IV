//ABRI FORMULARIO DE REGISTRO
function ModalRegistroUsuarios() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_usuario").modal({ backdrop: 'static', keyboard: false });
    cargar_select_rol('select_rol', null, false).then(() => {
        $("#modal_registro_usuario").modal('show'); 
    }).catch(() =>{ 
        alert('No se pudo cargar los roles correctamente.');
});
}

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
                    return '<img class="img-responsive" style="width:55px; border-radius:50%;" src="/media/' + data + '">';
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
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>&nbsp;<button class='btn btn-success btn-sm disabled'><i class='fa fa-check-circle'></i></button>&nbsp;<button class='desactivar btn btn-danger btn-sm'><i class='fa fa-trash'></i></button>&nbsp;<button class='foto btn btn-default btn-sm'><i class='fa fa-image'></i></button>&nbsp;<button class='contra btn btn-secondary btn-sm'><i class='fa fa-key'></i></button>"
                    }else{
                    return "<button class='btn btn-primary btn-sm editar'><i class='fa fa-edit'></i></button>&nbsp;<button class='activar btn btn-success btn-sm'><i class='fa fa-check-circle'></i></button>&nbsp;<button class='btn btn-danger btn-sm disabled'><i class='fa fa-trash'></i></button>&nbsp;<button class='foto btn btn-default btn-sm'><i class='fa fa-image'></i></button>&nbsp;<button class='contra btn btn-secondary btn-sm'><i class='fa fa-key'></i></button>"
                    }
                }
            }
        ],
        "language": {
            "url": languageUrl
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

        document.getElementById('txt_idusuario_editar').value = data.id;
        document.getElementById('txt_usuario_editar').value = data.username;
        document.getElementById('txt_email_editar').value = data.email

        var rolActual =  data.rol_nombre;
        console.log(rolActual)

        cargar_select_rol('select_rol_editar', rolActual, true)

        $(".form-control").removeClass("is-invalid").removeClass("is-valid");
        $("#modal_editar_usuario").modal({ backdrop: 'static', keyboard: false });
        $("#modal_editar_usuario").modal('show');
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
function cargar_select_rol(selectElementId, rolActual, esEdicion = false) {
    var select = $('#' + selectElementId);
    select.empty();

    fetch('/cargar_roles/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.roles) {
            var rolEncontrado = false;
            data.roles.forEach(function(role) {
                select.append(new Option(role.rol_nombre, role.rol_nombre)); // Usar rol_nombre como valor y texto
                if (rolActual !== null && rolActual !== undefined && role.rol_nombre === rolActual) {
                    rolEncontrado = true;
                }
            });

            if (rolActual !== null && rolActual !== undefined) {
                if (esEdicion) {
                    if (!rolEncontrado) {
                        setTimeout(function() {
                            Swal.fire({
                                title: 'Alerta',
                                text: 'El rol seleccionado está inactivo o no existe.',
                                icon: 'warning',
                                confirmButtonText: 'Entendido'
                            });
                        }, 1000);
                    } else {
                        select.val(rolActual).trigger('change');
                    }
                } else {
                    select.val(rolActual).trigger('change');
                }
            }
        } else {
            console.error("Error al cargar los roles: ", data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

//Registrar Usuario
function registrar_usuario() {
    const ids = {
        usuario: 'txt_usuario',
        contra: 'txt_contra',
        email: 'txt_email',
        foto: 'txt_foto'
    };

    if (!validarInput(ids, 'registro')) {
        return;
    }

    const usuario = document.getElementById('txt_usuario').value.trim();
    const contra = document.getElementById('txt_contra').value.trim();
    const email = document.getElementById('txt_email').value.trim();
    const rol = document.getElementById('select_rol').value;
    const foto = document.getElementById('txt_foto').value;

    if (!validarEmail(email).valido) {
        $("#" + ids.email).addClass("is-invalid");
        return Swal.fire("Mensaje de Advertencia", "El formato del email ingresado es incorrecto", "warning");
    }

    let extension = foto.split('.').pop().toLowerCase();
    let nombrefoto = "";
    let f = new Date();
    if (foto.length > 0) {
        nombrefoto = "IMG" + f.getDate() + "" + (f.getMonth() + 1) + "" + f.getFullYear() + "" +
            f.getHours() + "" + f.getMilliseconds() + "." + extension;
    }

    let formData = new FormData();
    let fotoobject = $("#txt_foto")[0].files[0];
    formData.append('u', usuario);
    formData.append('c', contra);
    formData.append('e', email);
    formData.append('r', rol);
    formData.append('nombrefoto', nombrefoto);
    formData.append('foto', fotoobject);

    $.ajax({
        url: '/registrar_usuario/',
        type: 'POST',
        headers: { "X-CSRFToken": getCookie('csrftoken') },
        data: formData,
        contentType: false,
        processData: false,
        success: function (resp) {
            if (resp.success) {
                limpiar_modal_usuario();
                Swal.fire("Mensaje de Éxito", resp.message, "success").
                    then((value) => {
                        $("#modal_registro_usuario").modal('hide');
                        tbl_usuario.ajax.reload();
                    });
            } else {
                if (resp.message.includes("El usuario ya existe")) {
                    $("#txt_usuario").addClass("is-invalid");
                }
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        }
    });
    return false;
}

//VALIDACIONES//
function validarUsuario(usuario) {
    const regex = /^[a-zA-Z0-9_@.-]+$/;
    return { valido: regex.test(usuario), mensaje: "El nombre de usuario solo debe contener letras, números, y los caracteres especiales _ @ . -" };
}

function validarContrasena(contra) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return { valido: regex.test(contra), mensaje: "La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número." };
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

function validarInput(ids, contexto) {
    const { usuario, contra, email, foto } = ids;
    let camposVacios = false;
    let errores = [];

    const validarCampo = (campoId, validarFn) => {
        const campo = document.getElementById(campoId);
        if (!campo) {
            console.error(`El campo con ID ${campoId} no existe.`);
            camposVacios = true;
            return;
        }
        const valor = campo.value.trim();
        if (valor.length === 0 && campoId !== foto) {
            camposVacios = true;
            $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
        } else {
            const resultado = (campoId === foto) ? validarFoto(campoId) : validarFn(valor);
            if (!resultado.valido) {
                errores.push(resultado.mensaje);
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        }
    };

    validarCampo(usuario, validarUsuario);
    validarCampo(email, validarEmail);
    
    if (contexto === 'registro') {
        validarCampo(contra, validarContrasena);
        validarCampo(foto, validarFoto);
    }

    if (camposVacios) {
        Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
        return false;
    }

    if (errores.length > 0) {
        Swal.fire("Mensaje de Advertencia", errores.join("<br>"), "warning");
        return false;
    }

    return true;
}
//VALIDACIONES//

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
    const ids = {
        usuario: 'txt_usuario_editar',
        email: 'txt_email_editar'
    };

    let id = document.getElementById('txt_idusuario_editar').value;
    let rol = document.getElementById('select_rol_editar').value;
    let email = document.getElementById('txt_email_editar').value;
    let usuario = document.getElementById('txt_usuario_editar').value;

    if (id.length == 0 || email.length == 0 || rol.length == 0 || usuario.length == 0) {
        validarInput(ids, 'modificar');
        return Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
    }

    if (!validarInput(ids, 'modificar')) {
        return;
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
            email: email,
            usuario: usuario
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
            if (data.message.includes("El usuario ya existe")) {
                $("#txt_usuario_editar").addClass("is-invalid");
            }
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
    const id = document.getElementById('idusuariocontra').value;
    const nueva_contraseña = document.getElementById('txt_contra_nueva').value;
    const repetir_contraseña = document.getElementById('txt_contra_repetir').value;

    if (id.length == 0 || nueva_contraseña.length == 0 || repetir_contraseña.length == 0) {
        validarInputContra("txt_contra_nueva", "txt_contra_repetir");
        return Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
    }

    if (nueva_contraseña !== repetir_contraseña) {
        Swal.fire("Error", "Las contraseñas no coinciden.", "error");
        return;
    }

    const contrasenaValidacion = validarContrasena(nueva_contraseña);
    if (!contrasenaValidacion.valido) {
        $("#" + 'txt_contra_nueva').addClass("is-invalid");
        $("#" + 'txt_contra_repetir').addClass("is-invalid");
        return Swal.fire("Mensaje de Advertencia", contrasenaValidacion.mensaje, "warning");
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

function validarInputContra(contra_nueva, contra_repetir) {
    Boolean(document.getElementById(contra_nueva).value.length > 0) ? $("#" + contra_nueva)
        .removeClass("is-invalid").addClass("is-valid") : $("#" + contra_nueva).addClass("is-invalid");

    Boolean(document.getElementById(contra_repetir).value.length > 0) ? $("#" + contra_repetir)
        .removeClass("is-invalid").addClass("is-valid") : $("#" + contra_repetir).addClass("is-invalid");
}    

//Modificar Foto
$('#tabla_usuario').on('click', '.foto', function () {
    var data = tbl_usuario.row($(this).parents('tr')).data();

    if (tbl_usuario.row(this).child.isShown()) {
        data = tbl_usuario.row(this).data();
    }
    $("#modal_editar_foto").modal({ backdrop: 'static', keyboard: false })
    $("#modal_editar_foto").modal('show')

    document.getElementById('idusuariofoto').value = data.id
    document.getElementById('lbl_usuario_foto').innerHTML = data.username
})

$('#modal_editar_foto').on('hidden.bs.modal', function () {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
});

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
    
function Modificar_Foto_Usuario() {
    var id = document.getElementById('idusuariofoto').value;
    const fotoInputId = 'txt_foto_editar';
    const fileInput = document.getElementById(fotoInputId);
    const file = fileInput.files[0];

    // Verificar si se ha seleccionado una foto
    if (!file) {
        $("#" + fotoInputId).addClass("is-invalid");
        return Swal.fire("Mensaje de Advertencia", "Debe seleccionar una foto para actualizar.", "warning");
    }

    const fotoValidation = validarFoto(fotoInputId);

    if (!fotoValidation.valido) {
        $("#" + fotoInputId).addClass("is-invalid");
        return Swal.fire("Mensaje de Advertencia", fotoValidation.mensaje, "warning");
    }

    const foto = fileInput.value;
    let extension = foto.split('.').pop().toLowerCase();
    let nombrefoto = "";
    let f = new Date();
    if (foto.length > 0) {
        nombrefoto = "IMG" + f.getDate() + "" + (f.getMonth() + 1) + "" + f.getFullYear() + "" +
            f.getHours() + "" + f.getMilliseconds() + "." + extension;
    }

    let formData = new FormData();
    let fotoobject = $("#" + fotoInputId)[0].files[0];
    formData.append('id', id);
    formData.append('nombrefoto', nombrefoto);
    formData.append('foto', fotoobject);

    $.ajax({
        url: '/actualizar_foto/',
        type: 'POST',
        headers: { "X-CSRFToken": getCookie('csrftoken') },
        data: formData,
        contentType: false,
        processData: false,
        success: function (resp) {
            if (resp.success) {
                Swal.fire("Mensaje de Éxito", resp.message, "success").then((value) => {
                    $("#modal_editar_foto").modal('hide');
                    tbl_usuario.ajax.reload();
                    document.getElementById(fotoInputId).value = "";
                    $("#" + fotoInputId).removeClass("is-invalid"); 
                    $("#user_picture").attr("src", resp.new_picture_url);
                });
            } else {
                Swal.fire("Mensaje de Error", resp.message, "error");
            }
        }
    });
    return false;
}



