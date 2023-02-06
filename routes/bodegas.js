/**
 * Popsy Pedidos
 * Rutas para Super admin ➜ Bodegas
 *
 * Autor: Armando@Joonik
 */

const express = require('express');

// Modelos
const bodegas = require('../models/bodegas');

// Middlewares
const sa_logged = require('./sa-logged');

var router = express.Router();


/**************************************************
 * GET /bodegas
 */
router.get('/', (req, res) => {
	if (!req.session.usuario || req.session.usuario.rol != 1) {
		res.redirect('/');
		return;
	}

	res.render('bodegas.njk', {usuario: req.session.usuario});
});


/**************************************************
 * POST /bodegas
 * (Agregar nueva o editar)
 */
router.post('/', sa_logged, (req, res) => {
	req.body.id = parseInt(req.body.id);
	req.body.comprobante = parseInt(req.body.comprobante);
	req.body.doc_id = parseInt(req.body.doc_id);

	bodegas.agregar(req.body, (err) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.end();
	});
});


/**************************************************
 * POST /bodegas/lista
 * (datatable)
 */
router.post('/lista', sa_logged, (req, res) => {
	bodegas.lista(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.json(dtr);
	});
});


/*************************************************************************************************/

module.exports = router;
