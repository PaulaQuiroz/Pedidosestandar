$(function() {

    // Pagina index
    let tabla = $('#tabla').DataTable({
        columns: [
            {data: 'nombre'},
            {data: 'habilitado'},
            {data: null},
            //{data: null}
        ],
        columnDefs: [{
            render: (data, type, row) => row.habilitado === 'S' ? 'Habilitado': 'Deshabilitado',
            targets: 1
        },{
            render: function(data, type, row) {
                return `<a type="button" class="waves-effect waves-light btn lime darken-2" href="${ document.location.origin }/categorias/editar/${ row.id }">Editar</a>`
            },
            targets: 2
        }/*, {
            render: function(data, type, row) {
                return `<a type="button" class="waves-effect waves-light btn yellow darken-2" href="${ document.location.origin }/categorias/eliminar/${ row.id }">Eliminar</a>`
            },
            targets: 2
        }*/]
    });

    tabla.on('draw.dt', function() {
        $('#tabla .dropdown-button').off().dropdown({beloworigin: true});
    });

    tabla.ajax.url('/categorias/lista').load();


    $('#agregar-categoria').click(() => location.assign(document.location.origin + '/categorias/agregar'));


    // Pagina de agregar usuarios
    $('#crear-categoria').click(() => {

        let parametros = {};

        parametros.nombre       = $('#nombre').val();
        parametros.habilitado   = $('#habilitado').val();


        if (!parametros.nombre) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.habilitado) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }


        $.post(`${ document.location.origin }/categorias/crear`, parametros, (data) => {

            if (data.success) {
                $('#completado-modal').openModal({dismissible: false});
            }
            else {
                $('#error-modal').openModal({dismissible: false});
            }

        }, 'json');
    });


    $('#btn-volver-atras').click(function() {
        location.assign(document.location.origin + '/categorias');
    });


    // Pagina de actualizar usuarios
    $('#actualizar-categoria').click(() => {

        let parametros = {};

        parametros.nombre       = $('#nombre').val();
        parametros.habilitado   = $('#habilitado').val();
        parametros.id           = $('#id-categoria').val();


        if (!parametros.nombre) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }

        if (!parametros.habilitado) {
            $('#verificacion-modal').openModal({dismissible: false});
            return false;
        }


        $.post(`${ document.location.origin }/categorias/actualizar`, parametros, (data) => {

            if (data.success) {
                $('#completado-modal').openModal({dismissible: false});
            }
            else {
                $('#error-modal').openModal({dismissible: false});
            }

        }, 'json');
    });
});


