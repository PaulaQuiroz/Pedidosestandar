/**
 * Popsy Pedidos
 * Ruta para Super admin ➜ Productos
 *
 * Autor: Armando@Joonik
 */

const express = require('express');

// Modelos
const cadenas = require('../models/cadenas');
const precios = require('../models/precios');
const productos = require('../models/productos');

// Middlewares
const sa_logged = require('./sa-logged');

var router = express.Router();


/**************************************************
 * GET /productos
 */
router.get('/', (req, res, next) => {
	if (!req.session.usuario || req.session.usuario.rol != 1) {
		res.redirect('/');
		return;
	}
	cadenas.lista((err, lista) => {
		if (err) {
			next(err);
			return;
		}
		res.render('productos.njk', {
			usuario: req.session.usuario,
			cadenas: lista
		});
	});
});


/**************************************************
 * GET /productos/grupos-precios/:cadena
 */
router.get('/grupos-precios/:cadena/:nit/:sucursal', sa_logged, (req, res) => {
	precios.grupos_precios(req.params, (err, gps) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(gps);
	});
});

/**************************************************
 * GET /productos/nit-sucursal/:cadena
 */
router.get('/nit-sucursal/:cadena', sa_logged, (req, res) => {
	precios.nit_sucursal(req.params.cadena, (err, data) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(data);
	});
});


/**************************************************
 * POST /productos/:cadena/:grupo_precios
 * (datatable)
 */
router.post('/:cadena/:grupo_precios', sa_logged, (req, res) => {
	req.body.cadena = parseInt(req.params.cadena);
	// req.body.grupo_precios = parseInt(req.params.grupo_precios);
	req.body.grupo_precios = req.params.grupo_precios;
	productos.tabla_config(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});


/**************************************************
 * POST /productos/activar
 */
router.post('/activar', sa_logged, (req, res) => {
	productos.activar(req.body, (err) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.end();
	});
});


/*************************************************************************************************/

module.exports = router;
