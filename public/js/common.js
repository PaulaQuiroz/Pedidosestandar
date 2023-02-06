$(document).ready(function() {
	$('#yr').html((new Date()).getFullYear());

	$('select').material_select();

	$('.modal-trigger').leanModal();

  	$('.toggle-menu').sideNav();

	$('.close').click(function(){
		$('.side-nav').sideNav('hide');
	})

	$.fn.dataTable.ext.errMode = function(settings, techNote, message) {
		Materialize.toast('Error al procesar los datos de la tabla', 2500);
		console.log(message);
	};

	$.extend(true, $.fn.dataTable.defaults, {
		processing: true,
		serverSide: true,
		ordering: false,
		pageLength: 20,
		dom: 'tip<"clearfix">',
		ajax: {
			dataType: 'json',
			type: 'POST'
		},
		language: {
			info: 'Registros _START_ - _END_ de _TOTAL_',
			infoEmpty: '0 registros',
			infoFiltered: ', filtrado de _MAX_',
			emptyTable: '<div class="center">No hay coincidencias</div>',
			zeroRecords: '<div class="center">No hay coincidencias</div>',
			paginate: {
				previous: '&lt; Anterior',
				next: 'Siguiente &gt;'
			}
		},
		deferLoading: 0
	});

	$('.upload').change(function(evt) {
		var self = $(this);
		var reader = new FileReader();
		var file = this.files[0];
		reader.onload = function(evt) {
			$('#img-result').css('visibility', 'visible');
			$('#img-result').prop('src', evt.target.result);
		};
		reader.readAsDataURL(file);
	});

 	$('.datepicker').pickadate({
	 	klass: {date_display: 'hide'},
	    selectMonths: true, 
	    selectYears: 15
  	});

});

/*Script del Reloj */
(function actualizaReloj() {
	var Hoy = new Date(),
	Hora = Hoy.getHours(),
	Minutos = Hoy.getMinutes(),
	Segundos = Hoy.getSeconds(),
	dn = "a.m";
	if (Hora > 12) {
		dn = "p.m"
		Hora = Hora - 12
	}
	if (Hora == 0)
		Hora = 12
	if (Hora <= 9)
		Hora = "0" + Hora
	if (Minutos <= 9)
		Minutos = "0" + Minutos
	if (Segundos <= 9)
		Segundos = "0" + Segundos
	var Dia = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
	var Mes = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
	var Anio = Hoy.getFullYear();
	document.getElementById('Fecha_Reloj').innerHTML = Dia[Hoy.getDay()] + ", " + Hoy.getDate() + " de " + Mes[Hoy.getMonth()] + " de " + Anio + " " + Hora + ":" + Minutos + ":" + Segundos + " " + dn
	setTimeout(actualizaReloj, 1000)
})();
