/**
 * Popsy Pedidos
 * Modelo de cadenas
 *
 * Autor: Armando@Joonik
 */

const sql = require('mssql');
const async = require('async');

var db = require('../db');

const query = `SELECT
CADENA.CODIGO AS id,
RTRIM(CADENA.CADENA) AS nombre
FROM CADENA
INNER JOIN Tercero ON CADENA.CODIGO = Tercero.CADENA
INNER JOIN Bodega ON Tercero.BODEGA_DESPACHO = Bodega.Codigo
INNER JOIN BodegaUbicacion ON Bodega.Bodega_ID = BodegaUbicacion.Bodega_ID
INNER JOIN CentroSubCentroCosto ON CentroSubCentroCosto.CentroCosto_ID = 110 AND Tercero.SUB_CENTRO = CentroSubCentroCosto.CodigoSubcentro
INNER JOIN Cliente ON Cliente.Tercero_ID = Tercero.Tercero_ID
WHERE Tercero.PEDIDOS_INST = 1
GROUP BY CADENA.CODIGO, CADENA.CADENA`;

/**************************************************
 * Métodos del modelo a exportar
 */


/**************************************************
 * Importar desde SQL Server (Habilitar insersiones de key en 0 en la DB "SET GLOBAL sql_mode='NO_AUTO_VALUE_ON_ZERO'")
 * @param {Function} callback Función retorno (error)
 */
const importar = (callback) => {
	// Configuración de conexión a SQL Server
	let connection = new sql.Connection({
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
			request.query(query, cb);
		},

		// Cada fila que llegue desde SQL Server se guarda en la DB de la aplicación
		(recordset, affected, cb) => {
			db.raw("SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO'").then(() => { 
			async.eachSeries(recordset, (row, cb_each) => {
				db.raw(db('cadenas').insert(row).toString() + " ON DUPLICATE KEY UPDATE id = id, `nombre` = '" + row.nombre + "'").asCallback(cb_each);
			}, cb)});
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
			request.query(query, cb);
		},

		// Cada fila que llegue desde SQL Server se guarda en la DB de la aplicación
		(recordset, affected, cb) => {
			async.eachOfSeries(recordset, async (row, index, cb_each) => {
				// Buscar elemento
				const item = await db('cadenas').where({'id': row.id}).first();
				if (item) {
					// Comparar elementos
					var keys = Object.keys(item)
					keys.forEach((i) => {
						if(row[i] != item[i]) {
							errors.push({
								// id: item.id,
								nombreColumna: i,
								nombre: item.nombre,
								valorActual: item[i],
								valorImportar: row[i],
							})
						}
					});
				} else {
					errors.push({
						id: row.id,
						nombre: row.producto,
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
 * Listar cadenas
 * @param {Function} callback Función retorno (error, objeto de cadenas encontradas)
 */
const lista = (callback) => {
	db('cadenas')
        .select()
        .orderBy('nombre','asc')
        .asCallback(callback);
};


/*************************************************************
 * Consulta todas las cadenas del sistema
 */
const todo = async () => {

    return db('cadenas', (err, data) => data)
        .orderBy('nombre', 'asc');
};


/*************************************************************
 * Consulta todos los ids de cadenas contatenados por comas
 */
const todosLosIdsConcatenados = async () => db('cadenas', (err, data) => data).select(db.raw('GROUP_CONCAT(id) AS ids'));


/*************************************************************************************************/

module.exports = {
	importar: importar,
	lista,
	todo,
    todosLosIdsConcatenados,
    verificarImportar,
};
