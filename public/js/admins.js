$(function() {
	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'username'},
			{data: 'nombre'},
            {data: 'descripcion'},
            {data: 'categoria'},
			{data: 'habilitado'},
			{data: 'habilitado'}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return data ? 'Activo' : 'Inactivo';
			},
			targets: 4
		},{
			render: function(data, type, row) {
				var div = $('<div />');
				var ul = $('<ul />').prop('id', 'dd-' + row.id).addClass('dropdown-content');

				ul.append($('<li />').append($('<a />').prop('href', '#').attr('data-activates', data).addClass('activar').html(data ? 'Desactivar' : 'Activar')));
				ul.append($('<li />').append($('<a />').prop('href', '#').addClass('restablecer').html('Restablecer Contraseña')));

				div.append($('<button />').addClass('dropdown-button btn').attr('data-activates', 'dd-' + row.id).html('Acciones&nbsp;&#9660;'));
				div.append(ul);

				return div.html();
			},
			targets: 5
		}]
	});

	tabla.on('draw.dt', function() {
		$('#tabla .dropdown-button').off().dropdown({beloworigin: true});
	});

	$('#tabla').on('click', '.activar', function(e) {
		e.preventDefault();
		$.post(`${ document.location.origin }/usuarios/habilitar`, {
			id: $(this).parents('ul').prop('id').split('-').pop(),
			habilitado: parseInt($(this).data('activates')) == 1 ? 0 : 1
		}).done(function(data) {
			tabla.ajax.reload();
		}).fail(function(jqXHR) {
			var err;
			try {
				err = ': ' + jqXHR.responseJSON.error;
			} catch(e) {
				err = ' usuario';
			}
			Materialize.toast('Error al deshabilitar' + err, 2500);
		});

	}).on('click', '.restablecer', function(e) {
		e.preventDefault();

		$('#restablecer-hidden').val($(this).parents('ul').prop('id').split('-').pop());
		$('#restablecer-modal').openModal();
	});

	$('#cadenas').change(function() {
		
		var cadena = $(this).val();
		if (cadena==0) {
			$('#container-segmentos').removeClass('hide');
			$.get('/admins/segmentos/' )
			.done(function(segmentos) {
				var elem = $('#segmentos');
				elem.prop('disabled', false).empty();
				for (var i = 0; i < segmentos.length; i++) {
					var value = text = segmentos[i].segmento
					elem.append($('<option>').val(value).html(text));
				}
				elem.change().material_select();

			}).fail(function(jqXHR) {
				var err = 'Error';
				try {
					err += ': ' + jqXHR.responseJSON.error;
				} catch(e) {}
				Materialize.toast(err, 2500);
			});


			return;
		}
		$('#container-segmentos').addClass('hide');
		$('.card.hide').removeClass('hide');
		$('#agregar-hidden').val(cadena);
		$('#agregar-segmento-hidden').val('');
		tabla.ajax.url('/admins/admins-cadena/' + cadena).load();
	});

	$('#segmentos').change(function() {
		var cadena = $('#cadenas').val();
		var segmento = $(this).val();
		$('.card.hide').removeClass('hide');
		$('#agregar-hidden').val(cadena);
		$('#agregar-segmento-hidden').val(segmento);

		var urlRequest = '/admins/admins-cadena/' + cadena;
		if (segmento) {
			urlRequest = urlRequest + '/' + segmento;
		}
		tabla.ajax.url(urlRequest).load();
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
		$.post('/admins', $(self).serialize()).done(function() {
			self.reset();
			$(self).closeModal();
			tabla.ajax.reload();

		}).fail(function(jqXHR) {
			var err;
			try {
				err = ': ' + jqXHR.responseJSON.error;
			} catch(e) {
				err = ' nuevo administrador de cadena';
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
