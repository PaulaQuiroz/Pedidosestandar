/**
 * Popsy Pedidos
 * Modelo de grupos
 *
 * Autor: Armando@Joonik
 */

var db = require('../db');


// Queries constantes
const query_tabla_puntos_venta = (data) => {
	if (data.cadena) {
		return db('puntos_venta')
		.where('cadena', data.cadena);
	}

	return db('grupos')
	.innerJoin('puntos_venta', 'grupos.punto_venta', 'puntos_venta.id')
	.where('grupos.usuario', data.sup);
};

const async = require('async');


/**************************************************
 * Métodos del modelo a exportar
 */


/**************************************************
 * Activar / desactivar producto para cadena de acuerdo a su lista de precios
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error)
 */
const activar = (data, callback) => {
	if (data.grupo) {
		db('grupos')
		.where('id', parseInt(data.grupo))
		.del()
		.asCallback(callback);
		return;
	}

	for (var key in data) {
		data[key] = parseInt(data[key]);
	}

	db('grupos')
	.insert(data)
	.asCallback(callback);
};


/**************************************************
 * Obtener lista de puntos de venta de un grupo de acuerdo al ID del supervisor
 * @param {Integer}  sup      ID del supervisor de grupo
 * @param {Function} callback Función retorno (error, objeto de puntos de venta)
 */
const puntos_venta = (sup, callback) => {
	query_tabla_puntos_venta({sup: sup})
	.select('puntos_venta.id', 'puntos_venta.nombre')
	.asCallback(callback);
};


/**************************************************
 * Obtener lista de puntos de venta de un grupo en formato datatables
 * @param {Integer}  data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const tabla_puntos_venta = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		// Contar resultados totales
		(cb) => {
			query_tabla_puntos_venta(data)
			.select(db.raw('COUNT(puntos_venta.id) AS total'))
			.asCallback(cb);
		},

		// Guarda el total y obtiene el total filtrado
		(total, cb) => {
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;

			if (total < 1 || data['columns[0][search][value]'].length < 1) {
				cb(null, [{filtered: total}]);
				return;
			}

			query_tabla_puntos_venta(data)
			.select(db.raw('COUNT(puntos_venta.id) AS filtered'))
			.andWhere('puntos_venta.nombre', 'LIKE', `%${data['columns[0][search][value]']}%`)
			.asCallback(cb);
		},

		// Guarda el total filtrado y busca datos en db
		(filtered, cb) => {
			filtered = filtered[0] ? filtered[0].filtered : 0;

			dtr.recordsFiltered = filtered;

			if (filtered < 1) {
				cb(null, []);
				return;
			}

			var q = query_tabla_puntos_venta(data)
			.select('puntos_venta.id', 'puntos_venta.nombre', 'puntos_venta.direccion', 'puntos_venta.ciudad')
			.limit(data.length)
			.offset(parseInt(data.start));

			if (data['columns[0][search][value]'].length > 0) {
				q.andWhere('puntos_venta.nombre', 'LIKE', `%${data['columns[0][search][value]']}%`);
			}

			q.asCallback(cb);
		},

		(usuarios, cb) => {
			dtr.data = usuarios;
			cb(null, dtr);
		}

	], callback);
};


/*************************************************************************************************/

module.exports = {
	activar: activar,
	puntos_venta: puntos_venta,
	tabla_puntos_venta: tabla_puntos_venta
};
