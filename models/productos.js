/**
 * Popsy Pedidos
 * Modelo de productos
 *
 * Autor: Armando@Joonik
 */

const sql = require('mssql');
const async = require('async');

var db = require('../db');

// Queries constantes
const query_importar = `SELECT
Inventario_ID AS id,
Codigo AS codigo,
RTRIM(Descripcion) AS nombre,
Referencia AS presentacion
FROM Inventario
WHERE Pedido_Institucional = 1`;

const query_tabla_config = (data) => {
	return db('precios')
	.innerJoin('productos', 'precios.producto', 'productos.id')
	.leftJoin('productos_habilitados', {
		'productos_habilitados.cadena': data.cadena,
		'precios.id': 'productos_habilitados.precio_id'
	})
	.where('precios.grupo_precios', data.grupo_precios)
	.andWhere('precios.precio', '>', 0);
};

/**************************************************
 * Métodos del modelo a exportar
 */


/**************************************************
 * Importar desde SQL Server
 * @param {Function} callback Función retorno (error)
 */
const importar = (callback) => {
	// Configuración de conexión a SQL Server
	var connection = new sql.Connection({
		server: process.env.MSSQL_SERVER || 'localhost',
		// server: 'localhost',
		user: process.env.MSSQL_USER || 'joonik',
		password: process.env.MSSQL_PASS || '123',
		database: process.env.MSSQL_DB || 'POPSY0032018'
	});

	async.waterfall([
		// Conectar a SQL Server
		(cb) => {
			connection.connect(cb);
		},

		// Guarda los nuevos valores
		(cb) => {
			var request = new sql.Request(connection);
			request.query(query_importar, cb);
		},

		// Cada fila que llegue desde SQL Server se guarda en la DB de la aplicación
		(recordset, affected, cb) => {
			async.eachOfSeries(recordset, (row, index, cb_each) => {
				db.raw(db('productos').insert(row).toString() + " ON DUPLICATE KEY UPDATE `presentacion` = '" + row.presentacion + "', `nombre` = '" + row.nombre + "', `codigo` = '" + row.codigo + "'").asCallback(cb_each);
			}, cb);
		}

	], (err) => {
		connection.close();
		callback(err);
	});
};

/*
 * Verificar que los datos importados se agregaron y actualizaron exitosamente
 */
const verificarImportar = (callback) => {
	// Configuración de conexión a SQL Server
	var connection = new sql.Connection({
		server: process.env.MSSQL_SERVER || 'localhost',
		user: process.env.MSSQL_USER || 'joonik',
		password: process.env.MSSQL_PASS || '123',
		database: process.env.MSSQL_DB || 'POPSY0032018'
	});

	var errors = [];

	async.waterfall([
		// Conectar a SQL Server
		(cb) => {
			connection.connect(cb);
		},

		// Guarda los nuevos valores
		(cb) => {
			var request = new sql.Request(connection);
			request.query(query_importar, cb);
		},

		// Cada fila que llegue desde SQL Server se guarda en la DB de la aplicación
		(recordset, affected, cb) => {
			async.eachOfSeries(recordset, async (row, index, cb_each) => {
				// Buscar elemento
				const item = await db('productos').where({'id': row.id}).first();
				if (item) {
					// Comparar elementos
					var keys = Object.keys(item)
					keys.forEach((i) => {
						if(row[i] != item[i]) {
							errors.push({
								// id: item.id,
								nombreColumna: i,
								codigo: item.codigo,
								valorActual: item[i],
								valorImportar: row[i],
							})
						}
					});
				} else {
					errors.push({
						id: row.id,
						codigo: row.codigo,
						nombre: row.nombre,
						presentacion: row.presentacion,
					})
				}
			}, cb);
		},

	], (err) => {
		connection.close();
		callback(err, errors);
	});
}


/**************************************************
 * Lista de productos para habilitar/deshabilitar por cadena
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const tabla_config = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		// Contar resultados totales
		(cb) => {
			query_tabla_config(data)
			.select(db.raw('COUNT(productos.id) AS total'))
			.asCallback(cb);
		},

		// Guarda el total y obtiene el total filtrado
		(total, cb) => {
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;

			if (total < 1 || data['columns[1][search][value]'].length < 1) {
				cb(null, [{filtered: total}]);
				return;
			}

			query_tabla_config(data)
			.select(db.raw('COUNT(productos.id) AS filtered'))
			.andWhere('productos.nombre', 'LIKE', `%${data['columns[1][search][value]']}%`)
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

			var q = query_tabla_config(data)
			.select('productos.*', 'precios.precio', 'precios.id AS precio_id', 'productos_habilitados.id AS activo')
			.orderBy(db.raw('-productos_habilitados.id'), 'desc')
			.orderBy('productos.nombre', 'asc')
			.limit(data.length)
			.offset(parseInt(data.start));

			if (data['columns[1][search][value]'].length > 0) {
				q.andWhere('productos.nombre', 'LIKE', `%${data['columns[1][search][value]']}%`);
			}

			q.asCallback(cb);
		},

		(productos, cb) => {
			dtr.data = productos;
			cb(null, dtr);
		}

	], callback);
};


/**************************************************
 * Activar / desactivar producto para cadena de acuerdo a su lista de precios
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error)
 */
const activar = (data, callback) => {
	if (data.id) {
		db('productos_habilitados')
		.where('id', parseInt(data.id))
		.del()
		.asCallback(callback);
		return;
	}

	for (var key in data) {
		data[key] = parseInt(data[key]);
	}

	db('productos_habilitados')
	.insert(data)
	.asCallback(callback);
};


/*************************************************************
 * Consulta todos los ids de cadenas contatenados por comas
 */
const todosLosIdsConcatenados = async () => db('productos', (err, data) => data).select(db.raw('GROUP_CONCAT(id) AS ids'));


/*************************************************************
 * Consulta todos los ids de productos
 */
const todosLosIds = async () => db('productos', (err, data) => data).select('id');


/*************************************************************************************************/

module.exports = {
	importar: importar,
	tabla_config: tabla_config,
	activar: activar,
    todosLosIdsConcatenados,
    todosLosIds,
    verificarImportar,
};
