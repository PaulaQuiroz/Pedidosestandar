/**
 * Popsy Pedidos
 * Ruta para Admin de cadena & Supervisor de grupo ➜ Facturas
 *
 * Autor: Armando@Joonik
 */

const express = require('express');

// Modelos
const pedidos = require('../models/pedidos');
const usuarios = require('../models/usuarios');

var router = express.Router();

const { asyncMiddlewareWeb } = require('./middleware');

/**************************************************
 * GET /pedidos
 */
router.get('/', asyncMiddlewareWeb(async(req, res, next) => {
	if (!req.session.usuario || req.session.usuario.rol < 2) {
		res.redirect('/');
		return;
	}

    const categoria = await usuarios.categoriaUsuario(req.session.usuario.id);

	res.render('pedidos.njk', {
	    usuario: req.session.usuario,
        precioHabilitado: categoria
	});
}));


/**************************************************
 * POST /pedidos
 * (datatable)
 */
router.post('/', (req, res) => {
	req.body.usuario = req.session.usuario;

	pedidos.tabla(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});


/**************************************************
 * GET /pedidos
 */
router.get('/:num', asyncMiddlewareWeb(async(req, res, next) => {
	if (!req.session.usuario || req.session.usuario.rol < 2) {
		res.redirect('/');
		return;
	}

    const categoria = await usuarios.categoriaUsuario(req.session.usuario.id);

	res.render('pedidos-num.njk', {
	    usuario: req.session.usuario,
        precioHabilitado: categoria
	});
}));


/**************************************************
 * POST /pedidos/:num
 */
router.post('/:num', (req, res, next) => {
	req.body.usuario = req.session.usuario;
	pedidos.tabla_num(parseInt(req.params.num), req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});

/*************************************************************************************************/

module.exports = router;
