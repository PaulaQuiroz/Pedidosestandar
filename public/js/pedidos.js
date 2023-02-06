$(function() {
	var path = window.location.pathname.split('/');
	var sup = path.pop();

    let tabla = $('#tabla');

	if (!sup) {
		sup = path.pop();
	}

    if (precioHabilitado === 'true') {
        tabla = tabla.DataTable({
            columns: [
                {data: 'num'},
                {data: 'nombre'},
                {data: 'cantidades'},
                {data: 'precio'},
                {data: 'fecha_elaboracion'},
                {data: 'despacho'},
                {data: null}
            ],
            columnDefs: [{
                render: function(data, type, row) {
                    return 'Z-' + row.comprobante + '-' + row.num
                },
                targets: 0
            },{
                render: (data, type, row) => '$' + row.precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                targets: 3
            }, {
                render: function(data, type, row) {
                    return '<a type="button" class="waves-effect waves-light btn lime darken-2" href="/pedidos/'+ row.num + '">Detalle</a>'
                },
                targets: 6
            }]
        });
    }
    else {
        tabla = tabla.DataTable({
            columns: [
                {data: 'num'},
                {data: 'nombre'},
                {data: 'cantidades'},
                {data: 'fecha_elaboracion'},
                {data: 'despacho'},
                {data: null}
            ],
            columnDefs: [{
                render: function(data, type, row) {
                    return 'Z-' + row.comprobante + '-' + row.num
                },
                targets: 0
            }, {
                render: function(data, type, row) {
                    return '<a type="button" class="waves-effect waves-light btn lime darken-2" href="/pedidos/'+ row.num + '">Detalle</a>'
                },
                targets: 5
            }]
        });
    }

	tabla.ajax.url('/pedidos').load(); // moment
});
