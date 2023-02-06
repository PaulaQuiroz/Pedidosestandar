/**
 * Popsy Pedidos
 * Modelo de grupos
 *
 * Autor: Miguel@Joonik
 */

const async = require('async');

var db = require('../db');
const puntosVentas = require('./puntos-venta');

// Queries constantes
const query_tabla = (data) => {
	
	var q = db(db.raw('pedidos, puntos_venta, bodegas'));

	if (data.usuario.rol === 4) {
		q.where('punto_venta', data.usuario.punto_venta);
	} else if (data.usuario.rol === 3) {
		q.whereIn('punto_venta', db.raw('(select punto_venta from grupos where usuario = ' + data.usuario.id + ') '));
	} else if (data.usuario.rol === 2) {
		q.whereIn('punto_venta', db.raw('(select id from puntos_venta where cadena = ' + data.usuario.cadena + ') '));
	} else {
		return;
	}
	return q;
};

const post_test = (data) => {

	if (data.cadena) {
		return db('puntos_venta')
		.where('cadena', data.cadena);
	}

	return db('grupos')
	.innerJoin('puntos_venta', 'grupos.punto_venta', 'puntos_venta.id')
	.where('grupos.usuario', data.sup);
};

/**************************************************
 * Info de un usuario de acuerdo a su id
 * @param {Object}   id       Id del usuario
 * @param {Function} callback Función retorno (error, objeto de usuario)
 */
const info = (id, callback) => {
	db('usuarios').select('username', 'nombre', 'descripcion').where('id', id).asCallback(callback);
};


/**************************************************
 * Listar pedidos
 * @param {Object} data
 * @param {Function} callback 
 */
const tabla = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {

			var q = query_tabla(data);

			if (q) {
				q.countDistinct('num as total')
				.asCallback(cb);
			} else {
				cb(new Error('Rol no válido'))
			}
		},

		(total, cb) => {	// Busca datos en db
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;
			dtr.recordsFiltered = total;

			if (total < 1) {
				cb(null, []);
				return;
			}
			var q = query_tabla(data);

			if (q) {
				q
				.select(
					db.raw(" pedidos.num, SUM(pedidos.cantidad) AS cantidades, SUM(pedidos.precio) AS precio, puntos_venta.nombre, bodegas.comprobante, DATE_FORMAT(pedidos.fecha, '%Y-%m-%d %H:%i:%s') AS fecha, DATE_FORMAT(pedidos.fecha, '%Y-%m-%d - %H:%i %p') AS fecha_elaboracion, pedidos.punto_venta, puntos_venta.lunes, puntos_venta.martes, puntos_venta.miercoles, puntos_venta.jueves, puntos_venta.viernes, puntos_venta.sabado, puntos_venta.domingo")
				)
				.andWhere(db.raw('puntos_venta.id = pedidos.punto_venta AND puntos_venta.bodega = bodegas.id'))
				.groupBy('num', 'fecha', 'puntos_venta.nombre', 'bodegas.comprobante', 'pedidos.punto_venta', 'puntos_venta.martes', 'puntos_venta.miercoles', 'puntos_venta.jueves', 'puntos_venta.viernes', 'puntos_venta.sabado', 'puntos_venta.domingo')
				.limit(data.length)
				.offset(parseInt(data.start));
				q.asCallback(cb);
			} else {
				cb(new Error('Rol no válido'))
			}
		},

		(pedidos, cb) => {
			dtr.data = calculoDespacho(pedidos);
			cb(null, dtr);
		}

	], callback);
};


const tabla_num = (num, data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {

			db('pedidos')
			.select(db.raw('COUNT(num) AS total'))
			.where('num', num)
			.asCallback(cb);
		},

		(total, cb) => {	// Busca datos en db
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;
			dtr.recordsFiltered = total;

			if (total < 1) {
				cb(null, []);
				return;
			}

			db
			.select(db.raw("pedidos.id, productos.nombre, pedidos.cantidad, CONCAT('$',FORMAT(pedidos.precio,0)) AS precio"))
			.from(db.raw('pedidos, productos'))
			.where(db.raw('pedidos.num = ' + num + ' AND productos.id = pedidos.producto'))
			.limit(data.length)
			.offset(parseInt(data.start))
			.asCallback(cb);

		},

		(pedidos, cb) => {
			dtr.data = pedidos;
			cb(null, dtr);
		}

	], callback);
};


/**************************************************
 * Calculo de despacho
 * @param {Object} data
 */
const calculoDespacho = (data) => {

    let aDate = {
        1: {name: 'lunes'},
        2: {name: 'martes'},
        3: {name: 'miercoles'},
        4: {name: 'jueves'},
        5: {name: 'viernes'},
        6: {name: 'sabado'},
        7: {name: 'domingo'}
    };

    data.forEach((pedido, key) => {

        let date    = new Date(pedido.fecha), // 2018-10-10
            number  = date.getDay() === 7 ? 0 : date.getDay(),
            cnt     = 1,
            tope    = 15;


        for (let i = number + 1; i < 8; i++) {

            i = pedido[aDate[i].name] === 1 ? 8 : i;
            i = cnt++ >= tope ? 8 : i;
            i = cnt < tope && i === 7 ? 0 : i;
        }

        data[key].despacho = cnt > 9 ? '' : sumarDia(cnt - 2, pedido.fecha);
    });

	return data;
};


/**************************************************
 * Suma los días dependiendo de una fecha
 * @param {Integer} dias
 * @param {String}  fecha
 */
const sumarDia = (dias, fecha) => {

    fecha = new Date(fecha);

    fecha.setDate(fecha.getDate() + parseInt(dias) + 1);

    let anhio   = fecha.getFullYear();
    let mes     = fecha.getMonth() + 1;
    let dia     = fecha.getDate();

    mes = (mes < 10) ? ("0" + mes) : mes;
    dia = (dia < 10) ? ("0" + dia) : dia;

    return anhio + '-' + mes + '-' + dia;
};


module.exports = {
	tabla,
	tabla_num
};