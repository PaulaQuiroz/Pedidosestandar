$(function() {
	$('.card-content').on('keyup', 'input[type=number]', function() {
		var v = this.value;
		if ($.isNumeric(v) === false) {
			this.value = '';
		}
	});

	$('#pedido').submit(function(e) {
		e.preventDefault();

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

		$('#atras').hide();
		$('#cp').hide();
		$('.blocker').show();

		$.post(window.location.pathname, $(this).serialize()).done(function(id) {
			alert('Pedido número ' + id + ' creado exitosamente!');
			atras();

		}).fail(function(jqXHR) {
			var err = 'Error';
			try {
				err += ': ' + jqXHR.responseJSON.error;
			} catch(e) {}
			alert(err);

		}).always(function() {
			$('.blocker').hide();
			$('#atras').show();
			$('#cp').show();
		});
	});
});
