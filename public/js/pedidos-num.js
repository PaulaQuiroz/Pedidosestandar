$(function() {
	let path = window.location.pathname.split('/');
	let num = path.pop();
    let tabla = $('#tabla');


	if (!num) {
		num = path.pop();
	}

	if (precioHabilitado === 'true') {
        tabla = tabla.DataTable({
            columns: [
                {data: 'nombre'},
                {data: 'cantidad'},
                {data: 'precio'},
            ]/*,
		columnDefs: [{
			render: function(data, type, row) {
				// return '<input type="checkbox" id="chk-' + row.id + '" class="chk filled-in"' +  (data ? ('data-grupo="' + data + '" checked') : '') + ' /><label for="chk-' + row.id + '"></label>';
				return '<a href="">DETALLE ' + row.num + '</a>';
			},
			targets: 3
		}]*/
        });
    }
    else {
        tabla = tabla.DataTable({
            columns: [
                {data: 'nombre'},
                {data: 'cantidad'},
            ]/*,
		columnDefs: [{
			render: function(data, type, row) {
				// return '<input type="checkbox" id="chk-' + row.id + '" class="chk filled-in"' +  (data ? ('data-grupo="' + data + '" checked') : '') + ' /><label for="chk-' + row.id + '"></label>';
				return '<a href="">DETALLE ' + row.num + '</a>';
			},
			targets: 3
		}]*/
        });
    }



	tabla.ajax.url('/pedidos/' + num).load();
});
