/**
 * Popsy Pedidos
 * Rutas para Super admin ➜ Importar
 *
 * Autor: Armando@Joonik
 */

const express = require('express');

// Modelos
// const importar = require('../models/importar');
const cadenas = require('../models/cadenas');
const precios = require('../models/precios');
const productos = require('../models/productos');
const puntosVentas = require('../models/puntos-venta');

// Middlewares
const { permisos, asyncMiddlewareApi } = require('./middleware');

let router = express.Router();
let acceso = [1];


/**************************************************
 * GET /importar
 */
router.get('/', (req, res) => {
	if (!req.session.usuario || req.session.usuario.rol != 1) {
		res.redirect('/');
		return;
	}

	res.render('importar.njk', {usuario: req.session.usuario});
});


/**************************
 * POST 
 */
/*
router.post('/detalle', asyncMiddlewareApi(async (req, res, next) => {

    if (!permisos(req, acceso)) { return; }

    let json            = {};
    let idsPre          = '';
    let idsPro          = '';
    let idsPV           = '';
    let idsCadenas      = await cadenas.todosLosIdsConcatenados();
    let idsPrecios      = await precios.todosLosIds();
    let idsProductos    = await productos.todosLosIds();
    let idsPuntosVentas = await puntosVentas.todosLosIds();


    // Concatenamos los ids de los precios
    idsPrecios.forEach(dataPre => {
        idsPre += ',' + dataPre.id;
    });

    // Concatenamos los ids de los productos
    idsProductos.forEach(dataPro => {
        idsPro += ',' + dataPro.id;
    });

    // Concatenamos los ids de los puntos de ventas
    idsPuntosVentas.forEach(dataPV => {
        idsPV += ',' + dataPV.id;
    });


    // 1. Consulta en SQL Server las cadenas diferentes del local
    importar.cadenas(idsCadenas[0].ids, (err, dataCadenas) => {

        json.cadenas = err ? [] : dataCadenas;

        // 2. Consulta en SQL Server los precios diferentes del local
        importar.precios(idsPre.substr(1), (err, dataPrecios) => {

            json.precios = err ? [] : dataPrecios;

            // 3. Consulta en SQL Server los productos diferentes del local
            importar.productos(idsPro.substr(1), (err, dataProductos) => {

                json.productos = err ? [] : dataProductos;

                // 4. Consulta en SQL Server los puntos de ventas diferentes del local
                importar.puntosVentas(idsPV.substr(1), (err, dataPuntosVentas) => {

                    json.puntos_venta = err ? [] : dataPuntosVentas;

                    res.json({results: json});
                });
            });
        });
    });
}));
*/

/*************************************************************************************************/

module.exports = router;
