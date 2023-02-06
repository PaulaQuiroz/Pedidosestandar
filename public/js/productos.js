$(function() {
	var fail = function(jqXHR) {
		var err = 'Error';
		try {
			err += ': ' + jqXHR.responseJSON.error;
		} catch(e) {}
		Materialize.toast(err, 2500);
	};

	var tabla = $('#tabla').DataTable({
		columns: [
			{data: 'codigo'},
			{data: 'nombre'},
			{data: 'presentacion'},
			{data: 'precio'},
			{data: 'activo'}
		],
		columnDefs: [{
			render: function(data, type, row) {
				return '$ ' + data.toLocaleString();
			},
			targets: 3
		},

		{
			render: function(data, type, row) {
				return '<input type="checkbox" id="chk-' + row.id + '" class="chk filled-in" data-precio-id="' + row.precio_id + '"' +  (data ? ('data-id="' + data + '" checked') : '') + ' /><label for="chk-' + row.id + '"></label>';
			},
			targets: 4
		}]
	});

	$('#cadenas').change(function() {
		$.get('/productos/nit-sucursal/' + $(this).val()).done(function(data) {
			var elem = $('#nit');
			elem.prop('disabled', false).empty();
			for (var i = 0; i < data.nits.length; i++) {
				var value = data.nits[i].nit
				elem.append($('<option>').val(value).html(value));
			}
			// $('.card.hide').removeClass('hide');
			elem.change().material_select();

			var elem2 = $('#sucursal');
			elem2.prop('disabled', false).empty();
			for (var i = 0; i < data.sucursales.length; i++) {
				var value = data.sucursales[i].sucursal
				elem2.append($('<option>').val(value).html(value));
			}
			// $('.card.hide').removeClass('hide');
			elem2.change().material_select();

		}).fail(fail);
	});

	var listadoGrupoPrecio = function () {
		if ($('#cadenas').val() && $('#nit').val() && $('#sucursal').val()) {
			$.get('/productos/grupos-precios/'+ $('#cadenas').val() + '/' + $('#nit').val() + '/' + $('#sucursal').val() ).done(function(gps) {
				var elem = $('#grupos-precios');
				elem.prop('disabled', false).empty();
				for (var i = 0; i < gps.length; i++) {
					var value = gps[i].grupo_precios
					var text = gps[i].grupo_precios_desc
					elem.append($('<option>').val(value).html(text));
				}
				$('.card.hide').removeClass('hide');
				elem.change().material_select();

			}).fail(fail);
		}
	}

	$('#nit').change(function() {
		listadoGrupoPrecio();
	});

	$('#sucursal').change(function() {
		listadoGrupoPrecio();
	});

	$('#grupos-precios').change(function() {
		tabla.ajax.url('/productos/' + $('#cadenas').val() + '/' + $(this).val()).load();
	});

	var to;
	document.getElementById('buscar').addEventListener('keyup', function() {
		clearTimeout(to);
		if (this.value.length === 1) {
			return;
		}
		to = setTimeout(tabla.column(1).search(this.value.toUpperCase()).draw, 1000);
	}, false);

	$('#tabla').on('click', '.chk', function(e) {
		e.preventDefault();

		var data = {id: $(this).data('id')};

		if (!data.id) {
			data = {
				cadena: $('#cadenas').val(),
				precio_id: $(this).data('precio-id'),
				grupo_precios: $('#grupos-precios').val()
			};
		}

		$.post('/productos/activar', data).done(function() {
			tabla.ajax.reload(null, false);

		}).fail(fail);
	});
});
