$(function() {
	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'username'},
			{data: 'nombre'},
			{data: 'descripcion'},
			{data: 'habilitado'},
			{data: 'habilitado'}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return data ? 'Activo' : 'Inactivo';
			},
			targets: 3
		},

		{
			render: function(data, type, row) {
				var div = $('<div />');
				var ul = $('<ul />').prop('id', 'dd-' + row.id).addClass('dropdown-content');

				ul.append($('<li />').append($('<a />').prop('href', '#').addClass('activar').html(data ? 'Desactivar' : 'Activar')));
				ul.append($('<li />').append($('<a />').prop('href', '#').addClass('restablecer').html('Restablecer Contraseña')));

				div.append($('<button />').addClass('dropdown-button btn').attr('data-activates', 'dd-' + row.id).html('Acciones&nbsp;&#9660;'));
				div.append(ul);

				return div.html();
			},
			targets: 4
		}]
	});

	tabla.on('draw.dt', function() {
		$('#tabla .dropdown-button').off().dropdown({beloworigin: true});
	});

	$('#tabla').on('click', '.activar', function(e) {
		e.preventDefault();

	}).on('click', '.restablecer', function(e) {
		e.preventDefault();

		$('#restablecer-hidden').val($(this).parents('ul').prop('id').split('-').pop());
		$('#restablecer-modal').openModal();
	});

	$('#pvs').change(function() {
		$('.card.hide').removeClass('hide');
		var pv = $(this).val();

		$('#agregar-hidden').val(pv);

		tabla.ajax.url('/pvs/usuarios/' + pv).load();
	});

	$('#agregar-modal').submit(function(e) {
		e.preventDefault();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		var self = this;

		if ($('#pass').val() != $('#re-pass').val()) {
			Materialize.toast('Las contraseñas no coinciden', 2500);
			$('#re-pass').val('');
			return;
		}
		$.post('/pvs/usuarios', $(self).serialize()).done(function() {
			self.reset();
			$(self).closeModal();
			tabla.ajax.reload();

		}).fail(function(jqXHR) {
			var err;
			try {
				err = ': ' + jqXHR.responseJSON.error;
			} catch(e) {
				err = ' nuevo usuario de punto de venta';
			}
			Materialize.toast('Error al agregar' + err, 2500);
		});
	});

	$('#restablecer-modal').submit(function(e) {
		e.preventDefault();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		var self = $(this);

		$.post('/perfil/restablecer-pass', self.serialize()).done(function() {
			self.closeModal();
			Materialize.toast('Nueva contraseña: popsy2016', 5000);

		}).fail(function(jqXHR) {
			var err = 'Error';

			try {
				err += ': ' + jqXHR.responseJSON.error;
			} catch(e) {}

			Materialize.toast(err, 2500);
		});
	});
});
