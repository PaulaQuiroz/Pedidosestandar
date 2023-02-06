/**
 * Popsy Pedidos
 * Ruta para Super admin ➜ Administradores
 *
 * Autor: Armando@Joonik
 */

const express = require('express');
const async = require('async');
const bcrypt = require('bcrypt');

// Modelos
const cadenas = require('../models/cadenas');
const usuarios = require('../models/usuarios');
const categorias = require('../models/categorias');
const puntos_venta = require('../models/puntos-venta');

// Middlewares
const sa_logged = require('./sa-logged');
const { asyncMiddlewareWeb } = require('./middleware');

var router = express.Router();

/**************************************************
 * GET /admins
 */
router.get('/', asyncMiddlewareWeb( async(req, res, next) => {

	if (!req.session.usuario || req.session.usuario.rol != 1) {
		res.redirect('/');
		return;
	}

    const listaCategorias = await categorias.todo();

	cadenas.lista((err, lista) => {
		if (err) {
			next(err);
			return;
		}

		res.render('admins.njk', {
			usuario: req.session.usuario,
			cadenas: lista,
            categorias: listaCategorias
		});
	});
}));

/**************************************************
 * POST /admins
 * (Agregar nuevo)
 */
router.post('/', sa_logged, (req, res) => {
	async.waterfall([
		(callback) => {	// Generar nueva contraseña
			bcrypt.genSalt(callback);
		},

		(salt, callback) => {	// Genera nueva contraseña encriptada
			bcrypt.hash(req.body.pass, salt, callback);
		},

		(hash, callback) => {	// Guarda el nuevo usuario
			req.body.pass = hash;
			req.body.rol = 2;
			usuarios.agregar_usuario(req.body, callback);
		}

	], (err) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.status(200).end();
	});
});

/**************************************************
 * GET /admins/segmentos
 */
router.get('/segmentos', asyncMiddlewareWeb( async(req, res, next) => {

	if (!req.session.usuario || req.session.usuario.rol != 1) {
		res.status(502).json({error: 'No permitido'});
		return;
	}

    puntos_venta.segmentos((err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.json(dtr);
	});

}));

/**************************************************
 * POST /admins/admins-cadena/:cadena
 * (datatable)
 */
router.post('/admins-cadena/:cadena/:segmento?', sa_logged, (req, res) => {
	req.body.cadena = parseInt(req.params.cadena);
	req.body.segmento = req.params.segmento;
	usuarios.admins_cadena(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.json(dtr);
	});
});

/*************************************************************************************************/

module.exports = router;
