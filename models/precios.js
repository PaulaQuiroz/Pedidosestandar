/**
 * Popsy Pedidos
 * Modelo de precios
 *
 * Autor: Armando@Joonik
 */

const sql = require('mssql');
const async = require('async');

var db = require('../db');

// Queries constantes
const query_importar = `SELECT
PrecioInventario.PrecioInventario_ID AS id,
Inventario.Inventario_ID AS producto,
ListaPrecio.Descripcion AS grupo_precios_desc,
ListaPrecio.ListaPrecio_ID AS grupo_precios,
Inventario.CANTIDADXEMBALAJE AS embalaje,
PrecioInventario.Precio AS precio
FROM PrecioInventario
INNER JOIN Inventario ON Inventario.Inventario_ID = PrecioInventario.Inventario_ID
INNER JOIN ListaPrecio ON ListaPrecio.ListaPrecio_ID = PrecioInventario.ListaPrecio_ID
WHERE Inventario.Pedido_Institucional = 1 AND PrecioInventario.Moneda_ID = 2`;

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
			async.eachSeries(recordset, (row, cb_each) => {
				db.raw(db('precios').insert(row).toString() + " ON DUPLICATE KEY UPDATE `grupo_precios_desc` = '" + row.grupo_precios_desc+ "', `grupo_precios`= " + row.grupo_precios + ", `embalaje` = " + row.embalaje + ', `precio` = ' + row.precio).asCallback(cb_each);
			}, cb);
		}

	], (err) => {
		connection.close();
		callback(err);
	});
};

/**************************************************
 * Verificar que los datos importados se agregaron y actualizaron exitosamente
 * @param {Function} callback Función retorno (error)
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
				const item = await db('precios').where({'id': row.id}).first();
				if (item) {
					// Comparar elementos
					var keys = Object.keys(item)
					keys.forEach((i) => {
						if(row[i] != item[i]) {
							errors.push({
								// id: item.id,
								nombreColumna: i,
								producto: item.producto,
								valorActual: item[i],
								valorImportar: row[i],
							})
						}
					});
				} else {
					errors.push({
						id: row.id,
						producto: row.producto,
						grupo_precios: row.grupo_precios,
						grupo_precios_desc: row.grupo_precios_desc,
						embalaje: row.embalaje,
						precio: row.precio,
					})
				}
			}, cb);
		},

	], (err) => {
		connection.close();
		callback(err, errors);
	});
}

/**
 * Listado de Nit y Sucursales por cadena
 * @param  {[type]}   cadena   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const nit_sucursal = (cadena, callback) => {
	async.waterfall([
		// Obtenemos el listado de nits del punto de venta (Agrupamos para evitar datos repetidos)
		(cb) => {
			db("puntos_venta")
			.select('nit')
			.where('cadena', cadena)
			.groupBy('nit')
			.asCallback((err, data) => {
				if (err) {
					cb(err);
					return;
				}
				cb(null, data)
			});
		},
		// Obtenemos el listado de 
		(data, cb) => {
			db("puntos_venta")
			.select('sucursal')
			.where('cadena', cadena)
			.groupBy('sucursal')
			.asCallback((err, sucursal) => {
				if (err) {
					cb(err);
					return;
				}
				cb(null, {nits: data, sucursales: sucursal})
			});
		},
	], callback);
};


/**************************************************
 * Obtener grupos de precios por cadenas
 * @param {Integer}  cadena   Id. de cadena
 * @param {Function} callback Función retorno (error, grupos de precios)
 */
const grupos_precios = ({cadena, nit, sucursal}, callback) => {
	db('puntos_venta')
	.select('grupo_precios', 'grupo_precios_desc')
	.where('cadena', cadena)
	.where('nit', nit)
	.where('sucursal', sucursal)
	.groupBy('grupo_precios', 'grupo_precios_desc')
	.asCallback((err, gps) => {
		if (err) {
			callback(err);
			return;
		}
		async.mapSeries(gps, (gp, cb) => {
			cb(null, {grupo_precios: gp.grupo_precios, grupo_precios_desc: gp.grupo_precios_desc});
		}, callback);
	});
};


/*************************************************************
 * Consulta todos los ids de cadenas contatenados por comas
 */
const todosLosIdsConcatenados = async () => db('precios', (err, data) => data).select(db.raw('GROUP_CONCAT(id) AS ids'));


/*************************************************************
 * Consulta todos los ids de precios
 */
const todosLosIds = async () => db('precios', (err, data) => data).select('id');



/*************************************************************************************************/

module.exports = {
	importar: importar,
	grupos_precios: grupos_precios,
	nit_sucursal,
    todosLosIdsConcatenados,
    todosLosIds,
    verificarImportar,
};
