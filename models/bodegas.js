/**
 * Popsy Pedidos
 * Modelo de bodegas
 *
 * Autor: Armando@Joonik
 */

const async = require('async');

var db = require('../db');


/**************************************************
 * Métodos del modelo a exportar
 */


/**************************************************
 * Obtener lista de bodegas
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const lista = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		// Contar resultados totales
		(cb) => {
			db('bodegas')
			.select(db.raw('COUNT(id) AS total'))
			.asCallback(cb);
		},

		// Busca datos en db
		(total, cb) => {
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;
			dtr.recordsFiltered = total;

			if (total < 1) {
				cb(null, []);
				return;
			}

			db('bodegas')
			.limit(data.length)
			.offset(parseInt(data.start))
			.asCallback(cb);
		},

		(bodegas, cb) => {
			dtr.data = bodegas;
			cb(null, dtr);
		}

	], callback);
};


/**************************************************
 * Agregar/editar bodega
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error)
 */
const agregar = (data, callback) => {
	db
		.raw(db('bodegas').insert(data).toString() + ` ON DUPLICATE KEY UPDATE nombre = '${data.nombre.replace("'", "")}', comprobante = ${data.comprobante}, doc_id = ${data.doc_id}, email = '${data.email}'`)
	.asCallback(callback);
};


/*************************************************************************************************/

module.exports = {
	lista: lista,
	agregar: agregar
};
