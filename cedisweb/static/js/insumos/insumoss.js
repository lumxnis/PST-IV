// ABRIR FORMULARIO DE REGISTRO DE INSUMOS
function ModalRegistroInsumo() {
    $(".form-control").removeClass("is-invalid").removeClass("is-valid");
    $("#modal_registro_insumo").modal({ backdrop: 'static', keyboard: false });
    cargar_select_provs('select_prov').then(() => { 
        $("#modal_registro_insumo").modal('show'); 
    }).catch(() =>{ 
        alert('No se pudo cargar los proveedores correctamente.');
    });
}

// LISTAR INSUMOS
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

var tbl_insumo;
function listar_insumos() {
    tbl_insumo = $("#tabla_insumo").DataTable({
        "pageLength": 10,
        "destroy": true,
        "processing": true,
        "deferRender": true,
        "serverSide": true,
        "ajax": {
            "url": "/listar_insumos/",
            "type": 'POST',
            "headers": { "X-CSRFToken": getCookie('csrftoken') },
            "dataSrc": "data"
        },
        "columns": [
            { "defaultContent": "" },
            { "data": "codigo" },
            { "data": "nombrep" },
            { "data": "cantidad" },
            { "data": "nombre_prov" },
            { "data": "descripcion" },
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

    tbl_insumo.on('draw.dt', function () {
        var PageInfo = $("#tabla_insumo").DataTable().page.info();
        tbl_insumo.column(0, { page: 'current' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
    });
}


// CARGAR PROVEEDORES EN SELECT
function cargar_select_provs(selectElementId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/cargar_provs/',
            type: 'POST',
            headers: { "X-CSRFToken": getCookie('csrftoken') },
        }).done(function (resp) {
            console.log("Respuesta del servidor:", resp);  

            try {
                if (resp.proveedores) {
                    var select = $('#' + selectElementId);
                    select.empty();
                    $.each(resp.proveedores, function (index, proveedor) {
                        select.append($('<option>', {
                            value: proveedor.cedula_prov,  
                            text: proveedor.nombre_prov + ' ' + proveedor.apellido_prov
                        }));
                    });
                    resolve();
                } else {
                    alert('Error al cargar los proveedores');
                    reject();
                }
            } catch (error) {
                console.error("Error al procesar la respuesta:", error);
                alert('Error al procesar los datos de los proveedores');
                reject();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error al realizar la solicitud AJAX:", textStatus, errorThrown);
            alert('Error al cargar los proveedores');
            reject();
        });
    });
}


//Limpiar Campos
function limpiar_modal_insumo() {
    document.getElementById('txt_cod').value = ""
    document.getElementById('txt_nombre').value = ""
    document.getElementById('txt_stock').value = ""
    document.getElementById('txt_des').value = ""
}

// Validar campos vacíos
function validarInput(codigo, nombrep, stock, descripcion, existeCodigo) {
    let camposVacios = false;
    let errores = [];

    const validarCampo = (campoId, valor, validarFn) => {
        if (valor.length === 0) {
            $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
            camposVacios = true;
        } else {
            const resultado = validarFn(valor);
            if (!resultado.valido) {
                $("#" + campoId).removeClass("is-valid").addClass("is-invalid");
                errores.push(resultado.mensaje);
            } else {
                $("#" + campoId).removeClass("is-invalid").addClass("is-valid");
            }
        }
    };

    validarCampo(codigo, document.getElementById(codigo).value, valor => ({valido: valor.length > 0, mensaje: "El código no puede estar vacío"}));
    validarCampo(nombrep, document.getElementById(nombrep).value, valor => ({valido: valor.length > 0, mensaje: "El nombre no puede estar vacío"}));
    validarCampo(stock, document.getElementById(stock).value, valor => ({valido: valor.length > 0 && !isNaN(valor) && parseInt(valor) > 0, mensaje: "El stock debe ser un número positivo"}));
    validarCampo(descripcion, document.getElementById(descripcion).value, valor => ({valido: valor.length > 0, mensaje: "La descripción no puede estar vacía"}));

    if (existeCodigo) {
        $("#" + codigo).removeClass("is-valid").addClass("is-invalid");
        errores.push("El código ya existe");
    }

    if (camposVacios) {
        Swal.fire("Mensaje de Advertencia", "Tiene algunos campos vacíos", "warning");
    }

    if (errores.length > 0) {
        Swal.fire("Mensaje de Error", errores.join("<br>"), "error");
        return false;
    }

    return true;
}

// REGISTRAR INSUMOS
function registrar_insumos() {
    let codigo = document.getElementById('txt_cod').value;
    let nombrep = document.getElementById('txt_nombre').value;
    let stock = document.getElementById('txt_stock').value;
    let proveedor = document.getElementById('select_prov').value;
    let descripcion = document.getElementById('txt_des').value;

    if (!validarInput('txt_cod', 'txt_nombre', 'txt_stock', 'txt_des', false)) {
        return;
    }

    let formData = new FormData();
    formData.append('c', codigo);
    formData.append('n', nombrep);
    formData.append('s', stock);
    formData.append('p', proveedor);
    formData.append('d', descripcion);

    $.ajax({
        url: '/registrar_insumo/',
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        data: formData,
        contentType: false,
        processData: false,
        success: function (resp) {
            if (resp.success) {
                limpiar_modal_insumo();
                Swal.fire("Mensaje de Éxito", resp.message, "success").then((value) => {
                    $("#modal_registro_insumo").modal('hide');
                    tbl_insumo.ajax.reload();
                });
            } else {
                if (resp.message.includes("El código ya existe")) {
                    validarInput('txt_cod', 'txt_nombre', 'txt_stock', 'txt_des', true);
                } else {
                    Swal.fire("Mensaje de Error", resp.message, "error");
                }
            }
        }
    });
    return false;
}

//MODAL MODIFICAR INSUMO
$(document).ready(function () {
    $('#tabla_insumo').on('click', '.editar', function () {
        var data = tbl_insumo.row($(this).parents('tr')).data();

        if (tbl_insumo.row(this).child.isShown()) {
            data = tbl_insumo.row(this).data();
        }

        cargar_select_provs('select_prov_editar').then(() => {
            $("#select_prov_editar option").each(function () {
                if ($(this).val() === data.proveedor_id) {
                    $(this).prop("selected", true);
                }
            });
            $("#select_prov_editar").trigger('change');
            $(".form-control").removeClass("is-invalid").removeClass("is-valid");
            $("#modal_editar_insumo").modal({ backdrop: 'static', keyboard: false });
            $("#modal_editar_insumo").modal('show');
        }).catch(() => {
            alert('No se pudo cargar los proveedores correctamente.');
        });

        document.getElementById('txt_cod_editar').value = data.codigo;
        document.getElementById('txt_nombre_editar').value = data.nombrep;
        document.getElementById('txt_stock_editar').value = data.cantidad;
        document.getElementById('txt_des_editar').value = data.descripcion;
    });
});


//MODIFICAR INSUMO
function Modificar_Insumo() {
    let codigo = document.getElementById('txt_cod_editar').value;
    let nombrep = document.getElementById('txt_nombre_editar').value;
    let stock = document.getElementById('txt_stock_editar').value;
    let proveedor = document.getElementById('select_prov_editar').value;
    let descripcion = document.getElementById('txt_des_editar').value;

    if (!validarInput("txt_cod_editar", "txt_nombre_editar", "txt_stock_editar", "txt_des_editar", false)) {
        return;
    }

    let formData = new FormData();
    formData.append('codigo', codigo);
    formData.append('nombrep', nombrep);
    formData.append('stock', stock);
    formData.append('proveedor', proveedor);
    formData.append('descripcion', descripcion);

    fetch('/modificar_insumo/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            codigo: codigo,
            nombrep: nombrep,
            stock: stock,
            proveedor: proveedor,
            descripcion: descripcion
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Modificación Exitosa", data.message, "success").then((value) => {
                $("#modal_editar_insumo").modal('hide');
                tbl_insumo.ajax.reload();
            });
        } else {
            if (data.message.includes("El código ya existe")) {
                validarInput("txt_cod_editar", "txt_nombre_editar", "txt_stock_editar", "txt_des_editar", true);
            } else {
                Swal.fire("Error", `No se pudieron actualizar los datos: ${data.message}`, "error");
            }
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}

//ELIMINAR INSUMOS
$('#tabla_insumo').on('click', '.eliminar', function () {
    var data = tbl_insumo.row($(this).parents('tr')).data();

    if (tbl_insumo.row(this).child.isShown()) {
        data = tbl_insumo.row(this).data();
    }

    Swal.fire({
        title: '¿Está seguro?',
        text: "¿Desea eliminar el insumo " + data.nombrep + "?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarInsumo(data.codigo);
        }
    });
});

function eliminarInsumo(codigo) {
    fetch('/eliminar_insumo/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            codigo: codigo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire("Eliminado", data.message, "success").then(() => {
                tbl_insumo.ajax.reload();
            });
        } else {
            Swal.fire("Error", `No se pudo eliminar el insumo: ${data.message}`, "error");
        }
    })
    .catch(error => {
        Swal.fire("Error", 'Error: ' + error, "error");
    });
}

