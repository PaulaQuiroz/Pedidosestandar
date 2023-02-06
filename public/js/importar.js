
let detailExport = {
    product: false,
    verifiedErrors: [],
    price: false,
    chains: false,
    sellingPoints: false,
    data: {
        productos: [],
        precios: [],
        cadenas: [],
        puntos_venta: [],
    },

    verificarErrores: function() {
        if (this.verifiedErrors) {
            this.mostrarErrores();
        }
    },

    mostrarErrores: function() {

            let tds               = '',
                tbodyProducto     = $('#tabla-productos').find('tbody'),
                tbodyPrecios      = $('#tabla-precios').find('tbody'),
                tbodyCadenas      = $('#tabla-cadenas').find('tbody'),
                tbodyPuntosVentas = $('#tabla-puntos-ventas').find('tbody');

            tbodyProducto.html('');
            tbodyPrecios.html('');
            tbodyCadenas.html('');
            tbodyPuntosVentas.html('');


            this.data.productos.forEach(datos => {

                if (datos.id) {
                    tds = `<td>El producto con ID: <strong>${datos.id}</strong> de nombre: <strong>${datos.nombre.replace("'", "")}</strong> no se pudo importar</td>`
                } else {
                    tds  = `<td>campo: <strong>${datos.nombreColumna}</strong>, 
                    de código <strong>${datos.codigo}</strong> en tabla <strong>PRODUCTOS</strong> no coincide. 
                    Valor a importar es <strong>${datos.valorImportar}</strong> 
                    y valor actual es <strong>${datos.valorActual}.</strong> 
                    Por favor revise los datos o contacte al administrador del sistema</td>`;
                }

                tbodyProducto.append(`<tr>${ tds }</tr>`);
            });


            this.data.precios.forEach(datos => {

                if (datos.id) {
                    tds = `<td>El precio con ID: <strong>${datos.id}</strong> e ID de producto: <strong>${datos.producto}</strong> no se pudo importar</td>`
                } else {
                    tds  = `<td>campo: <strong>${datos.nombreColumna}</strong>, 
                    de ID producto <strong>${datos.producto}</strong> en tabla <strong>PRECIOS</strong> no coincide. 
                    Valor a importar es <strong>${datos.valorImportar}</strong> 
                    y valor actual es <strong>${datos.valorActual}.</strong> 
                    Por favor revise los datos o contacte al administrador del sistema</td>`;
                }

                tbodyPrecios.append(`<tr>${ tds }</tr>`);
            });


            this.data.cadenas.forEach(datos => {

                if (datos.id) {
                    tds = `<td>La cadena con ID: <strong>${datos.id}</strong> de nombre: <strong>${datos.nombre}</strong> no se pudo importar</td>`
                } else { console.log(datos);
                    tds  = `<td>campo: <strong>${datos.nombreColumna}</strong>, 
                    de nombre <strong>${datos.nombre}</strong> en tabla <strong>CADENAS</strong> no coincide. 
                    Valor a importar es <strong>${datos.valorImportar}</strong> 
                    y valor actual es <strong>${datos.valorActual}.</strong> 
                    Por favor revise los datos o contacte al administrador del sistema</td>`;
                }

                tbodyCadenas.append(`<tr>${ tds }</tr>`);
            });


            this.data.puntos_venta.forEach(datos => {

                if (datos.id) {
                    tds = `<td>El punto de venta con ID: <strong>${datos.id}</strong> de nombre: <strong>${datos.nombre.replace("'", "")}</strong> no se pudo importar</td>`
                } else {
                    tds  = `<td>campo: <strong>${datos.nombreColumna}</strong>, 
                    de nombre <strong>${datos.nombre}</strong> en tabla <strong>PUNTOS DE VENTA</strong> no coincide. 
                    Valor a importar es <strong>${datos.valorImportar}</strong> 
                    y valor actual es <strong>${datos.valorActual}.</strong> 
                    Por favor revise los datos o contacte al administrador del sistema</td>`;
                }

                tbodyPuntosVentas.append(`<tr>${ tds }</tr>`);
            });


            if (this.data.productos.length)      { $('#bloque-productos').slideDown(300);}
            if (this.data.precios.length)        { $('#bloque-precios').slideDown(300);}
            if (this.data.cadenas.length)        { $('#bloque-cadenas').slideDown(300);}
            if (this.data.puntos_venta.length)   { $('#bloque-puntos-venta').slideDown(300);}
    }
};


$(function() {
	$('#confirmar-modal').openModal({dismissible: false});

	$('#cancelar').click(function() {
		$('.importing > .material-icons').html('close');
		$('#msg').html('Proceso de importación cancelado.');
	});

	$('#continuar').click(function() {
		var socket = io.connect('/importar');

		socket.on('inicio', function() {
			socket.emit('importar');
		});

		socket.on('productos', function(err) {
		    $('#productos').html(err ? 'close': 'check');
            detailExport.product = err !== '' && err !== null;
		});

        socket.on('verificar-productos', function(err) {
            if (err.errors.length>0) {
                $('#verificar-productos').html('close');
                detailExport.verifiedErrors.push(true);
                detailExport.data.productos = err.errors;
                return;
            }
            $('#verificar-productos').html('check');            
            detailExport.verifiedErrors.push(false);
        });

		socket.on('precios', function(err) {
			$('#precios').html(err ? 'close': 'check');
            detailExport.price = err !== '' && err !== null;
		});

        socket.on('verificar-precios', function(err) {
            if (err.errors.length>0) {
                $('#verificar-precios').html('close');
                detailExport.verifiedErrors.push(true);
                detailExport.data.precios = err.errors;
                return;
            }
            $('#verificar-precios').html('check');            
            detailExport.verifiedErrors.push(false);
        });

		socket.on('cadenas', function(err) {
			$('#cadenas').html(err ? 'close': 'check');
            detailExport.product = err !== '' && err !== null;
		});

        socket.on('verificar-cadenas', function(err) {
            if (err.errors.length>0) {
                $('#verificar-cadenas').html('close');
                detailExport.verifiedErrors.push(true);
                detailExport.data.cadenas = err.errors;
                return;
            }
            $('#verificar-cadenas').html('check');            
            detailExport.verifiedErrors.push(false);
        });

		socket.on('puntos_venta', function(err) {
			$('#puntos_venta').html(err ? 'close': 'check');
            detailExport.product = err !== '' && err !== null;
		});

        socket.on('verificar-puntosventa', function(err) {
            if (err.errors.length>0) {
                $('#verificar-puntosventa').html('close');
                detailExport.verifiedErrors.push(true);
                detailExport.data.puntos_venta = err.errors;
                return;
            }
            $('#verificar-puntosventa').html('check');            
            detailExport.verifiedErrors.push(false);
        });

		// socket.on('facturas', function(err) {
		// 	$('#facturas').html(err ? 'close': 'check');
  //           detailExport.finishedExecutions++;
		// });

		socket.on('fin', function(err) {
            if (err) {
                $('#msg').css('color', '#d32f2f')
                if (err.code=="ESOCKET") {
                    $('#msg').html('Error en el servidor. Por favor intente de nuevo o contacte al administrador del sistema');
                } else if (err.sqlState) {
                    $('#msg').html('Error en el formato de los datos. Por favor revise los datos o contacte al administrador del sistema');
                } else {
                    $('#msg').html('Error al importar bases de datos: ' + err.code);
                }
            } else if(detailExport.verifiedErrors.indexOf(true)!=-1) {
                $('#msg').css('color', '#d32f2f')
                $('#msg').html('Error al verificar los datos de la bases de datos');
            } else {
                $('#msg').css('color', '#00695c')
                $('#msg').html('Bases de datos de Popsy importadas exitosamente.');
            }
			socket.removeAllListeners();
			socket.disconnect();
            detailExport.verificarErrores();
		});
	});
});
