$(function() {
	var path = window.location.pathname.split('/');
	var sup = path.pop();
	if (!sup) {
		sup = path.pop();
	}

	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'nombre'},
			{data: 'sucursal'},
			{data: 'nit'},
			{data: 'direccion'},
			{data: 'ciudad'},
			{data: 'grupo'}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return '<input type="checkbox" id="chk-' + row.id + '" class="chk filled-in"' +  (data ? ('data-grupo="' + data + '" checked') : '') + ' /><label for="chk-' + row.id + '"></label>';
			},
			targets: -1
		}]
	});

	tabla.ajax.url('/sups/' + sup).load();

	var to;
	document.getElementById('buscar').addEventListener('keyup', function() {
		clearTimeout(to);

		if (this.value.length === 1) {
			return;
		}

		to = setTimeout(tabla.column(0).search(this.value.toUpperCase()).draw, 1000);
	}, false);

	$('#tabla').on('click', '.chk', function(e) {
		e.preventDefault();

		var data = {grupo: $(this).data('grupo')};

		if (!data.grupo) {
			data = {
				usuario: sup,
				punto_venta: $(this).prop('id').split('-').pop()
			};
		}

		$.post('/sups/activar', data).done(function() {
			tabla.ajax.reload(null, false);

		}).fail(function(jqXHR) {
			var err = 'Error';
			try {
				err += ': ' + jqXHR.responseJSON.error;
			} catch(e) {}
			Materialize.toast(err, 2500);
		});
	});

});
