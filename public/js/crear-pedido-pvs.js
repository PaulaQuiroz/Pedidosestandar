$(function() {
	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'nombre'},
			{data: 'direccion'},
			{data: 'ciudad'},
			{data: 'id'}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return '<a href="/crear-pedido/' + data + '" class="waves-effect waves-light btn lime darken-2" style="width: 175px;">Crear Pedido</a>';
			},
			targets: 3
		}]
	});

	tabla.ajax.url('/crear-pedido').load();

	var to;
	document.getElementById('buscar').addEventListener('keyup', function() {
		clearTimeout(to);
		if (this.value.length === 1) {
			return;
		}
		to = setTimeout(tabla.column(0).search(this.value.toUpperCase()).draw, 1000);
	}, false);
});
