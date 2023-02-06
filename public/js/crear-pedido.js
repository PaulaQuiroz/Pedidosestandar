$(function() {
	$('.card-content').on('keyup', 'input[type=number]', function() {
		var v = this.value;
		if ($.isNumeric(v) === false) {
			this.value = null;
		}
	});

	$('#pedido').submit(function(e) {
		e.preventDefault();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		$(this).hide();
		$('#confirmacion').show();

		$('#tabla-c').append($('#tabla > thead').clone());

		var tbody = $('<tbody />');

		$('.cantidad').each(function() {
			var cnt = parseInt(this.value);
			if (cnt && cnt > 0) {
				tbody.append($(this).parents('tr').clone());
			}
		});

		$('#tabla-c').append(tbody);
	});

	var atras = function() {
			$('#confirmacion').hide();
			$('#tabla-c').empty();
			document.getElementById('pedido').reset();
			$('#pedido').show();
	};

	$('#atras').click(atras);

	$('#confirmacion').submit(function(e) {
		e.preventDefault();
		$('#progress').show();

		if (!e.target.checkValidity()) {
			Materialize.toast('Por favor llene los campos requeridos', 2500);
			return;
		}

		$('.blocker').show();
		$('#cp').addClass('disabled');

		$.post(window.location.pathname, $(this).serialize()).done(function(id) {
			alert('Pedido número ' + id + ' creado exitosamente!');
			atras();

		}).fail(function(jqXHR) {
			var err = 'Error';
			try {
				err += ': ' + jqXHR.responseJSON.error;
			} catch(e) {}
			// Materialize.toast(err, 2500);
			$('#descripcion-moda-verificacion').html(err)
			$('#verificacion-modal').openModal({dismissible: false});


		}).always(function() {
			$('#cp').removeClass('disabled');
			$('.blocker').hide();
			$('#progress').hide();
		});
	});
});
