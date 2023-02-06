/**
 * Popsy Pedidos
 * Modelo de puntos de venta
 *
 * Autor: Armando@Joonik
 */

const sql = require('mssql');
const async = require('async');

var db = require('../db');

// Queries constantes
/*
const query = `SELECT
Tercero.Tercero_ID AS id,
Tercero.CADENA AS cadena,
Tercero.Identificacion AS nit,
CAST(Tercero.DigitoVerificacion AS INTEGER) AS dv,
RTRIM(Tercero.Nombre) AS nombre,
RTRIM(Tercero.Direccion) AS direccion,
RTRIM(Ciudad.Descripcion) AS ciudad,
RTRIM(Tercero.Telefono1) AS tel1,
RTRIM(Tercero.Telefono2) AS tel2,
Tercero.Ciudad_ID AS ciudad_id,
BodegaUbicacion.BodegaUbicacion_ID AS bodega,
CentroSubCentroCosto.CentroSubCentroCosto_ID AS cscc_id,
Cliente.ListaPrecio_ID AS grupo_precios,
Tercero.LUNES AS lunes,
Tercero.MARTES AS martes,
Tercero.MIERCOLES AS miercoles,
Tercero.JUEVES AS jueves,
Tercero.VIERNES AS viernes,
Tercero.SABADO AS sabado,
Tercero.DOMINGO AS domingo
FROM Tercero
INNER JOIN Ciudad ON Ciudad.Ciudad_ID = Tercero.Ciudad_ID
INNER JOIN Bodega ON Tercero.BODEGA_DESPACHO = Bodega.Codigo
INNER JOIN BodegaUbicacion ON Bodega.Bodega_ID = BodegaUbicacion.Bodega_ID
INNER JOIN CentroSubCentroCosto ON CentroSubCentroCosto.CentroCosto_ID = 110 AND Tercero.SUB_CENTRO = CentroSubCentroCosto.CodigoSubcentro
INNER JOIN Cliente ON Tercero.Tercero_ID = Cliente.Tercero_ID
WHERE Tercero.PEDIDOS_INST = 1
AND Cliente.ListaPrecio_ID IN (
	SELECT
	ListaPrecio.ListaPrecio_ID
	FROM PrecioInventario
	INNER JOIN Inventario ON Inventario.Inventario_ID = PrecioInventario.Inventario_ID
	INNER JOIN ListaPrecio ON ListaPrecio.ListaPrecio_ID = PrecioInventario.ListaPrecio_ID
	WHERE Inventario.Pedido_Institucional = 1 AND PrecioInventario.Moneda_ID = 2
	GROUP BY ListaPrecio.ListaPrecio_ID
)`;
*/
const query = `SELECT        Tercero.Tercero_ID AS id, Tercero.CADENA AS cadena, Tercero.Identificacion AS nit, CAST(Tercero.DigitoVerificacion AS INTEGER) AS dv,
RTRIM(REPLACE(Tercero.Nombre, CHAR(39), '')) AS nombre
,RTRIM(REPLACE(Tercero.Direccion, CHAR(39), '')) AS direccion, 
                         RTRIM(Ciudad.Descripcion) AS ciudad, RTRIM(Tercero.Telefono1) AS tel1, RTRIM(Tercero.Telefono2) AS tel2, Tercero.Ciudad_ID AS ciudad_id, BodegaUbicacion.BodegaUbicacion_ID AS bodega, 
                         CentroSubCentroCosto.CentroSubCentroCosto_ID AS cscc_id, Tercero.LUNES AS lunes, Tercero.MARTES AS martes, Tercero.MIERCOLES AS miercoles, Tercero.JUEVES AS jueves, Tercero.VIERNES AS viernes, 
                         Tercero.SABADO AS sabado, Tercero.DOMINGO AS domingo, Tercero.Sucursal AS sucursal, ListaPrecio.ListaPrecio_ID AS grupo_precios, ListaPrecio.Descripcion AS grupo_precios_desc, Tercero.SEGMENTO AS segmento
FROM            Tercero INNER JOIN
                         Ciudad ON Ciudad.Ciudad_ID = Tercero.Ciudad_ID INNER JOIN
                         Bodega ON Tercero.BODEGA_DESPACHO = Bodega.Codigo INNER JOIN
                         BodegaUbicacion ON Bodega.Bodega_ID = BodegaUbicacion.Bodega_ID INNER JOIN
                         CentroSubCentroCosto ON CentroSubCentroCosto.CentroCosto_ID = 110 AND Tercero.SUB_CENTRO = CentroSubCentroCosto.CodigoSubcentro INNER JOIN
                         Cliente ON Tercero.Tercero_ID = Cliente.Tercero_ID INNER JOIN
                         ListaPrecio ON Cliente.ListaPrecio_ID = ListaPrecio.ListaPrecio_ID
WHERE        (Tercero.PEDIDOS_INST = 1) AND (Cliente.ListaPrecio_ID IN
                             (SELECT        ListaPrecio_1.ListaPrecio_ID
                               FROM            PrecioInventario INNER JOIN
                                                         Inventario ON Inventario.Inventario_ID = PrecioInventario.Inventario_ID INNER JOIN
                                                         ListaPrecio AS ListaPrecio_1 ON ListaPrecio_1.ListaPrecio_ID = PrecioInventario.ListaPrecio_ID
                               WHERE        (Inventario.Pedido_Institucional = 0) AND (PrecioInventario.Moneda_ID = 2) 
                               GROUP BY ListaPrecio_1.ListaPrecio_ID))`

const query_tabla_grupo = (data) => {
	return db('puntos_venta')
	.leftJoin('grupos', 'puntos_venta.id', 'grupos.punto_venta')
	.where('puntos_venta.cadena', data.cadena)
	.whereNull('grupos.punto_venta')
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
		user: process.env.MSSQL_USER || 'joonik',
		password: process.env.MSSQL_PASS || '123',
		database: process.env.MSSQL_DB || 'POPSY0032022'
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
			async.eachSeries(recordset, (row, cb_each) => {
				db.raw(db('puntos_venta').insert(row).toString() + " ON DUPLICATE KEY UPDATE `nombre` = '" + row.nombre + "', `direccion` = '" + row.direccion + 
					"', `dv` = '" + row.dv + 
					"', `ciudad` = '" + row.ciudad + 
					"', `ciudad_id` = '" + row.ciudad_id + 
					"', `tel1` = '" + row.tel1 + 
					"', `tel2` = '" + row.tel2 + 
					"', `bodega` = " + row.bodega + 
					', `cscc_id` = ' + row.cscc_id + 
					', `grupo_precios` = ' + row.grupo_precios + 
					", `grupo_precios_desc` = '" + row.grupo_precios_desc + 
					"', `cadena` = "+ row.cadena +
					', `nit` = '+ row.nit +
					', `sucursal` = '+ row.sucursal +
                    ', `lunes` = ' + row.lunes +
                    ', `martes` = ' + row.martes +
                    ', `miercoles` = ' + row.miercoles +
                    ', `jueves` = ' + row.jueves +
                    ', `viernes` = ' + row.viernes +
                    ', `sabado` = ' + row.sabado +
                    ', `domingo` = ' + row.domingo +
                    ', `segmento` = ' + row.segmento
                ).asCallback(cb_each);
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
		database: process.env.MSSQL_DB || 'POPSY0032022'
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
				const item = await db('puntos_venta').where({'id': row.id}).first();
				
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
						nombre: row.nombre,
						direccion: row.direccion,
						ciudad: row.ciudad,
						tel1: row.tel1,
						tel2: row.tel2,
						bodega: row.bodega,
						cscc_id: row.cscc_id,
						grupo_precios: row.grupo_precios,
						grupo_precios_desc: row.grupo_precios_desc,
						lunes: row.lunes,
						martes: row.martes,
						miercoles: row.miercoles,
						jueves: row.jueves,
						viernes: row.viernes,
						sabado: row.sabado,
						domingo: row.domingo,
						segmento: row.segmento,
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
 * Lista de puntos de venta para habilitar/deshabilitar por grupo de supervisor
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const tabla_grupo = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {	// Contar resultados totales
			query_tabla_grupo(data)
			.select(db.raw('COUNT(puntos_venta.id) AS total'))
			.orWhere('grupos.usuario', data.sup)
			.asCallback(cb);
		},

		(total, cb) => {	// Busca datos en db
			total = total[0] ? total[0].total : 0;

			dtr.recordsTotal = total;

			if (total < 1 || data['columns[0][search][value]'].length < 1) {
				cb(null, [{filtered: total}]);
				return;
			}

			query_tabla_grupo(data)
			.select(db.raw('COUNT(puntos_venta.id) AS filtered'))
			.andWhere('puntos_venta.nombre', 'LIKE', `%${data['columns[0][search][value]']}%`)
			.orWhere('grupos.usuario', data.sup)
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

			var q = query_tabla_grupo(data)
			.select('puntos_venta.id', 'puntos_venta.nombre', 'puntos_venta.sucursal', 'puntos_venta.nit', 'puntos_venta.direccion', 'puntos_venta.ciudad', 'grupos.id AS grupo')
			.orderBy(db.raw('-grupos.id'), 'desc')
			.orderBy('puntos_venta.id', 'asc')
			.limit(data.length)
			.offset(parseInt(data.start));

			if (data['columns[0][search][value]'].length > 0) {
				q
				.andWhere('puntos_venta.nombre', 'LIKE', `%${data['columns[0][search][value]']}%`)
				.orWhere('grupos.usuario', data.sup)
				.andWhere('puntos_venta.nombre', 'LIKE', `%${data['columns[0][search][value]']}%`);

			} else {
				q.orWhere('grupos.usuario', data.sup)
			}

			q.asCallback(cb);
		},

		(usuarios, cb) => {
			dtr.data = usuarios;
			cb(null, dtr);
		}

	], callback);
};


/**************************************************
 * Obtiene productos asociados a un punto de venta
 * @param {Integer}  pv       Id del punto de venta
 * @param {Function} callback Función retorno (error, lista de productos)
 */
const productos = (pv, callback) => {
	db('puntos_venta')
	.select(
	    'productos.*',
        db.raw('FORMAT(precios.precio, 0) AS precio')
    )
	.innerJoin('productos_habilitados', 'puntos_venta.cadena', 'productos_habilitados.cadena')
	.innerJoin('precios', {
		'productos_habilitados.precio_id': 'precios.id',
		'puntos_venta.grupo_precios': 'precios.grupo_precios'
	})
	.innerJoin('productos', 'precios.producto', 'productos.id')
	.where('puntos_venta.id', pv)
	.andWhere('precios.precio', '>', 0)
	.asCallback(callback);
};


/**************************************************
 * Crea pedido en db de siigo
 * @param {Integer}  pv       Id de punto de venta
 * @param {Object}   data     Datos de productos
 * @param {Function} callback Función retorno (error, número de confirmación de pedido)
 */
const crear_pedido = (pv, data, callback) => {
	// Configuración de conexión a SQL Server
	var connection = new sql.Connection({
		server: process.env.MSSQL_SERVER || 'localhost',
		user: process.env.MSSQL_USER || 'joonik',
		password: process.env.MSSQL_PASS || '123',
		database: process.env.MSSQL_DB || 'POPSY0032022'
	});

	var txq = "DECLARE @num INT;\nSET @num = 1 + ISNULL((";

	var transaction;

	var comprobante;
	var gp;
	var num;
	var ep_id;

	var pedido_local = [];
	var desc_email = {tabla: []};

	async.waterfall([
		// Obtiene datos de punto de venta
		(cb) => {
			db('puntos_venta')
			.select('puntos_venta.*', 'bodegas.comprobante', 'bodegas.doc_id', 'bodegas.email')
			.innerJoin('bodegas', 'puntos_venta.bodega', 'bodegas.id')
			.where('puntos_venta.id', pv)
			.asCallback(cb);
		},

		// Comenzar a armar la petición para la transacción
		(pdv, cb) => {
			pdv = pdv.shift();

			if (typeof pdv === 'undefined') {
				cb(new Error('Parece haber un error. Este punto de venta no tiene una bodega asignada. Por favor revise la configuración o intente crearlo de nuevo'));
				return;
			}

			desc_email.pdv = pdv.nombre;
			desc_email.bodega_email = pdv.email;

			comprobante = pdv.comprobante;
			gp = pdv.grupo_precios;

			var knex = require('knex')({client: 'mssql'});
			var date = new Date();

			// Busca el número del último pedido ingresado con las condiciones actuales
			txq += knex('EncabezadoPedido')
			.max('Numero')
			.where({
				TipoDocumento: 'Z',
				Comprobante: comprobante
			})
			.toString();

			txq += "), 0);\n";

			// Inserta el encabezado del pedido
			txq += knex('EncabezadoPedido')
			.insert({
				Documento_ID: pdv.doc_id,
				Numero: knex.raw('@num'),
				TipoDocumento: 'Z',
				Comprobante: comprobante,
				FechaDocumento: date,
				FechaActualizacion: date,
				Estado: 0,
				Tercero_ID: pv,
				CentroSubCentroCosto_ID: pdv.cscc_id,
				MonedaOrigen__Moneda: 2,
				MonedaUsada__Moneda: 2,
				TasaCambioUsada: 0,
				Vendedor_ID: 11,
				Ciudad_ID: pdv.ciudad_id,
				Zona_ID: 1,
				Cobrador_ID: 11,
				Equipo_ID: 1,
				Operario_ID: 1,
				NombreTercero: pdv.nombre,
				DireccionTercero: pdv.direccion,
				Telefono1Tercero: pdv.tel1,
				Telefono2Tercero: pdv.tel2,
				ValorDeducible: 0,
				TipoDesmarco: '',
				FacturaDoble: 0,
				FechaPactadaEntrega: date,
				FechaEntregaReal: '1900-01-01',
				Usuario_ID: 2,
				Periodo_ID: 2 + date.getMonth(),	// En javaScript los meses comienzan desde cero
				TotalRetenciones: 0,
				TotalRetencionesExt: 0,
				TotalIva: 0,
				TotalIvaExt: 0,
				TotalImpoconsumo: 0,
				TotalImpoconsumoExt: 0,
				TotalImpuestoDeporte: 0,
				TotalImpuestoDeporteExt: 0,
				Prospecto_ID: 1,
				Contacto_ID: 1,
				FechaVigencia: date,
				NumeroEdi: '',
				DescripcionFormaPago: '',
				ComentarioAutorizacionPedido: '',
				LstEstadoAutorizacionStock_ID: 0,
				LstEstadoAutorizacionCupo_ID: 0,
				LstEstadoAutorizacionMora_ID: 0,
				AutorizacionStock__Usuario: 1,
				AutorizacionCupo__Usuario: 1,
				AutorizacionMora__Usuario: 1,
				FechaAutorizacionStock: '1900-01-01',
				FechaAutorizacionCupo: '1900-01-01',
				FechaAutorizacionMora: '1900-01-01',
				ModificadoPor__Usuario: 2,
				DireccionEnvio: pdv.direccion,
				CiudadEnvio__Ciudad: pdv.ciudad_id,
				OrdenCompraEDI: '',
				CodigoEANPadre: '',
				UltimaFechaModRegistro: date
			})
			.toString();

			txq += ";\n";

			// Crear variable para último ID insertado
			txq += "DECLARE @ep_id INT = SCOPE_IDENTITY();\n";

			// Crear variable para secuencia
			txq += "DECLARE @seq INT = 1;\n";

			async.eachOfSeries(data, (cantidad, inventario_id, cb_eos) => {
				inventario_id = parseInt(inventario_id);

				async.waterfall([
					// Obtener precio de producto
					(cb_w) => {
						db('productos')
						.select('productos.*', 'precios.embalaje', 'precios.precio')
						.innerJoin('precios', {
							'productos.id': 'precios.producto',
							'precios.grupo_precios': gp
						})
						.where('productos.id', inventario_id)
						.asCallback(cb_w);
					},

					// Insertar en SQL Server
					(pr, cb_w) => {
						pr = pr.shift();

						if (pr.embalaje) {
							cantidad *= pr.embalaje;
						}

						pedido_local.push({
							producto: inventario_id,
							cantidad: cantidad,
							precio: cantidad * pr.precio
						});

						desc_email.tabla.push({
							desc: pr.nombre,
							cantidad: cantidad
						});

						txq += knex('Pedido')
						.insert({
							EncabezadoPedido_ID: knex.raw('@ep_id'),
							Secuencia: knex.raw('@seq'),
							Tercero_ID: pv,
							Inventario_ID: inventario_id,
							BodegaUbicacion_ID: pdv.bodega,
							CentroSubCentroCosto_ID: pdv.cscc_id,
							UsaManufactura: 0,
							TipoDocOrigen: '',
							ComprobanteOrigen: '',
							NumeroOrigen: 0,
							SecuenciaOrigen: 0,
							FechaPactadaEntrega: date,
							FechaEntregaReal: date,
							CantidadPedida: cantidad,
							CantidadEntregada: 0,
							CantidadConversion: 0,
							InventarioFactorConversion_ID: 1,
							FactorConversionUsado: 0,
							CantidaPedSegundaUnidad: 0,
							CantidaEntSegundaUnidad: 0,
							ValorUnitario: pr.precio,
							ValorUnitarioExt: 0,
							ValorPedido: cantidad * pr.precio,
							ValorPedidoExt: 0,
							ValorEntregado: 0,
							ValorEntregadoExt: 0,
							PorcentajeImpoconsumo: 0,
							ValorImpoconsumo: 0,
							ValorImpoconsumoExt: 0,
							PorcentajeImpuestoDeporte: 0,
							ValorImpuestoDeporte: 0,
							ValorImpuestoDeporteExt: 0,
							PrecioInicial: pr.precio,
							FacturaInterna: 0,
							Descripcion: pr.nombre,
							ListaPrecio_ID: gp,
							Activo_ID: 1,
							Placa: '',
							FormaDePago_ID: 1,
							TipoEntradaPedido: 0,
							TipoSecuencia: 1,
							GrupoActivo_ID: 1,
							ValorRetencionItem: 0,
							ValorRetencionItemExt: 0,
							ValorIvaItem: 0.19 * cantidad * pr.precio,
							ValorIvaItemExt: 0,
							ValorPresCompra: 0,
							FechaCierre: date,
							TiempoDecision_ID: 1,
							ProbabilidadDecision_ID: 1,
							SaldoAnterior: 0,
							CantidadProducida: 0,
							ConceptoRequisicion_ID: 1,
							DescripcionLarga: '',
							Contratante__Tercero: 1,
							ImprimeDescLarga: 0,
							UltimaFechaModRegistro: date
						})
						.toString();

						txq += ";\nSET @seq = @seq + 1;\n";

						cb_w(null);
					}

				], cb_eos);
			}, cb);
		},

		// Prepara el retorno de la transacción y conecta a DB SQL Server
		(cb) => {
			txq += 'SELECT @num, @ep_id;';

			connection.connect(cb);
		},

		// Inicia la transacción
		(cb) => {
			transaction = new sql.Transaction(connection);
			transaction.begin(cb);
		},

		// Ejecuta la petición en la transacción
		(cb) => {
			var request = new sql.Request(transaction);
			request.query(txq, cb);
		},

		// Committear transacción
		(recordset, affected, cb) => {
			num = recordset[0][''][0];
			ep_id = recordset[0][''][1];

			transaction.commit(cb);
		}

	], (err) => {
		if (err) {
			if (transaction) {
				transaction.rollback((e) => {
					connection.close();

					if (e) {
						callback(e);
						return;
					}

					callback(err);
				});
				return;
			}

			connection.close();
			callback(err);
			return;
		}

		connection.close();

		// Guarda detalles del pedido en db local
		async.eachSeries(pedido_local, (p, cb) => {
			p.punto_venta = pv;
			p.num = num;
			p.ep_id = ep_id;
			db('pedidos')
			.insert(p)
			.asCallback(cb);

		}, (err) => {
			if (err) {
				console.error(err);
			}
			callback(null, 'Z-' + comprobante + '-' + num, desc_email);
		});
	});
};


/**************************************************
 * Obtiene info de punto de venta
 * @param {Integer}  pv       Id de punto de venta
 * @param {Function} callback Función retorno (error, objeto de info)
 */
const info = (pv, callback) => {
	db('puntos_venta')
	.select('nit', 'dv', 'nombre', 'direccion', 'ciudad', 'sucursal')
	.where('id', pv)
	.asCallback(callback);
};

/**************************************************
 * Obtiene info de segmentos
 * @param {Function} callback Función retorno (error, objeto de info)
 */
const segmentos = (callback) => {
	db('puntos_venta')
	.select('segmento')
	.groupBy('segmento')
	.asCallback(callback);
};


/**
 * Consulta todas las roles del sistema
 */
const todo = async () => {

    return db('puntos_venta', (err, data) => data).orderBy('nombre', 'asc');
};


/**
 * Consulta por id
 * @param {Integer} id
 */
const porID = async (id) => db('puntos_venta', (err, data) => data).where('id',id);


/*************************************************************
 * Consulta todos los ids de cadenas contatenados por comas
 */
const todosLosIdsConcatenados = async () => db('puntos_venta', (err, data) => data).select(db.raw('GROUP_CONCAT(id) AS ids'));


/*************************************************************
 * Consulta todos los ids de puntos de ventas
 */
const todosLosIds = async () => db('puntos_venta', (err, data) => data).select('id');

/*************************************************************************************************/

module.exports = {
	importar: importar,
	tabla_grupo: tabla_grupo,
	productos,
	crear_pedido,
	info,
	todo,
    porID,
    todosLosIds,
    verificarImportar,
    segmentos,
};
