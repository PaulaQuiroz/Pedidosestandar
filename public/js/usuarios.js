$(function() {

    // Pagina index
    let tabla = $('#tabla').DataTable({
        columns: [
            {data: 'username'},
            {data: 'nombre'},
            {data: 'email'},
            {data: 'rol'},
            {data: 'estado'},
            {data: null}
        ],
        columnDefs: [{
            render: function(data, type, row) {
                return row.estado ? 'Activo' : 'Inactivo';
            },
            targets: 4
        }, {
            render: function(data, type, row) {
                return `<a type="button" class="waves-effect waves-light btn lime darken-2" href="${ document.location.origin }/usuarios/editar/${ row.id }">Editar</a>`
            },
            targets: 5
        }]
    });

    tabla.on('draw.dt', function() {
        $('#tabla .dropdown-button').off().dropdown({beloworigin: true});
    });

    tabla.ajax.url('/usuarios/lista').load();


    $('#agregar-usuario').click(()=>{
        location.assign(document.location.origin + '/usuarios/agregar');
    });


    // Pagina de agregar usuarios
    $('#crear-usuario').click(() => {

        let parametros = {};

        parametros.username    = $('#username').val();
        parametros.email       = $('#email').val();
        parametros.nombre      = $('#nombre').val();
        parametros.pass        = $('#clave').val();
        parametros.descripcion = $('#descripcion').val();
        parametros.habilitado  = $('#estado').val();
        parametros.rol         = $('#rol').val();
        parametros.cadena      = $('#cadena').val();
        parametros.punto_venta = $('#punto-venta').val();

        $('#descripcion-moda-verificacion').text('Debe llenar todos los campos para continuar.');


        if (!parametros.username) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.email) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.nombre) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.pass) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }
        else if (parametros.pass.length < 6) {
            $('#descripcion-moda-verificacion').text('Ingrese al menos seis caracteres.');
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.habilitado) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.rol) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.cadena) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.punto_venta) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }


        $.post(`${ document.location.origin }/usuarios/crear`, parametros, (data) => {

            if (data.success) {
                $('#completado-modal').openModal({dismissible: false});
            }
            else {
                $('#error-modal').openModal({dismissible: false});
            }

        }, 'json');
    });


    $('#btn-volver-atras').click(function() {
        location.assign(document.location.origin + '/usuarios');
    });


    // Pagina de actualizar usuarios
    $('#actualizar-usuario').click(() => {

        let parametros = {};

        parametros.username    = $('#username').val();
        parametros.email       = $('#email').val();
        parametros.nombre      = $('#nombre').val();
        parametros.pass        = $('#clave').val();
        parametros.descripcion = $('#descripcion').val();
        parametros.habilitado  = $('#estado').val();
        parametros.rol         = $('#rol').val();
        parametros.cadena      = $('#cadena').val();
        parametros.punto_venta = $('#punto-venta').val();
        parametros.id          = $('#id-usuario').val();

        $('#descripcion-moda-verificacion').text('Debe llenar todos los campos para continuar.');


        if (!parametros.username) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.email) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.nombre) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (parametros.pass.length && parametros.pass.length < 6) {
            $('#descripcion-moda-verificacion').text('Ingrese al menos seis caracteres.');
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.habilitado) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.rol) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.cadena) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.punto_venta) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }


        $.post(`${ document.location.origin }/usuarios/actualizar`, parametros, (data) => {

            if (data.success) {
                $('#completado-modal').openModal({dismissible: false});
            }
            else {
                $('#error-modal').openModal({dismissible: false});
            }

        }, 'json');
    });
});


