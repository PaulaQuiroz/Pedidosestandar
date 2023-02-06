$(function() {
	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'id'},
			{data: 'nombre'},
			{data: 'comprobante'},
			{data: 'doc_id'},
			{data: 'email'},
			{data: null}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return '<button type="button" class="waves-effect waves-light btn lime darken-2 editar">Editar</button>';
			},
			targets: 5
		}]
	});

	tabla.on('draw.dt', function() {
		$('#tabla .dropdown-button').off().dropdown({beloworigin: true});
	});

	$('#tabla').on('click', '.editar', function(e) {
		e.preventDefault();

		$('.ae').html('Editar');

		var cols = $(this).parents('tr').children();
		$('#id-siigo').prop('readonly', true).val(cols[0].innerHTML);
		$('#nombre').val(cols[1].innerHTML);
		$('#comprobante').val(cols[2].innerHTML);
		$('#id-doc').val(cols[3].innerHTML);
		$('#email').val(cols[4].innerHTML);

		$('#agregar-modal').openModal();
	});

	tabla.ajax.url('/bodegas/lista').load();

	$('#agregar-bodega').click(function() {
		$('#id-siigo').prop('readonly', false);
		document.getElementById('agregar-modal').reset();
		$('.ae').html('Agregar');
		$('#agregar-modal').openModal();
	});

	$('#agregar-modal').submit(function(e) {
		e.preventDefault();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		var self = this;

		$.post('/bodegas', $(self).serialize()).done(function() {
			self.reset();
			$(self).closeModal();
			tabla.ajax.reload();

		}).fail(function(jqXHR) {
			var err;
			try {
				err = ': ' + jqXHR.responseJSON.error;

			} catch(e) {
				err = ' bodega';
			}

			Materialize.toast('Error al agregar/editar' + err, 2500);
		});

	}).on('keyup', 'input[type=number]', function() {
		var v = this.value;
		if ($.isNumeric(v) === false) {
			this.value = null;
		}
	});
});
