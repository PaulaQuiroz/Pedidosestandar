/**
 * Popsy Pedidos
 * Declaración de funciones para sockets
 *
 * Autor: Armando@Joonik
 */

const async = require('async');

// Modelos
const productos = require('./models/productos');
const precios = require('./models/precios');
const cadenas = require('./models/cadenas');
const puntos_venta = require('./models/puntos-venta');

module.exports = (server) => {
	var io = require('socket.io')(server);

	io.of('/importar').on('connection', (socket) => {
		socket.emit('inicio');

		socket.on('importar', () => {
			async.series([
				(callback) => {	// Importar productos
					productos.importar((err) => {
						socket.emit('productos', err);
						callback(err);
					});
				},

				(callback) => {	// Verificar productos
					productos.verificarImportar((err, errors) => {
						socket.emit('verificar-productos', {err, errors});
						callback(err);
					});
				},

				(callback) => {	// Importar precios
					precios.importar((err) => {
						socket.emit('precios', err);
						callback(err);
					});
				},

				(callback) => {	// Verificar productos
					precios.verificarImportar((err, errors) => {
						socket.emit('verificar-precios', {err, errors});
						callback(err);
					});
				},

				(callback) => {	// Importar cadenas
					cadenas.importar((err) => {
						socket.emit('cadenas', err);
						callback(err);
					});
				},

				(callback) => {	// Verificar productos
					cadenas.verificarImportar((err, errors) => {
						socket.emit('verificar-cadenas', {err, errors});
						callback(err);
					});
				},

				(callback) => {	// Importar puntos de venta
					puntos_venta.importar((err) => {
						socket.emit('puntos_venta', err);
						callback(err);
					});
				},

				(callback) => {	// Verificar productos
					puntos_venta.verificarImportar((err, errors) => {
						socket.emit('verificar-puntosventa', {err, errors});
						callback(err);
					});
				},

			], (err) => {
				socket.emit('fin', err);
			});
		});
	});
};
