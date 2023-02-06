$(function() {
	$('#cambiar-pass').submit(function(e) {
		e.preventDefault();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		var self = this;

		if ($('#nuevo-pass').val() != $('#re-nuevo-pass').val()) {
			Materialize.toast('Las contraseñas no coinciden', 2500);
			$('#re-nuevo-pass').val('');
			return;
		}
		$.post('/perfil/pass', $(self).serialize()).done(function() {
			self.reset();
			Materialize.toast('Contraseña actualizada correctamente', 2500);

		}).fail(function(jqXHR) {
			var err;
			try {
				err = ': ' + jqXHR.responseJSON.error;
			} catch(e) {
				err = ' al actualizar contraseña';
			}
			Materialize.toast('Error' + err, 2500);
		});
	});
});
