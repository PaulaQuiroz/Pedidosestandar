/**
 * Popsy Pedidos
 * Ruta para Supervisor de grupo ➜ Puntos de venta
 *
 * Autor: Armando@Joonik
 */

const express = require('express');
const async = require('async');
const bcrypt = require('bcrypt');

// Modelos
const grupos = require('../models/grupos');
const usuarios = require('../models/usuarios');

const sup_logged = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.rol == 3) {
		next();
		return;
	}
	res.status(403).json({error: 'Prohibido'});
};

var router = express.Router();

/**************************************************
 * GET /pvs
 */
router.get('/', (req, res, next) => {
	if (!req.session.usuario || req.session.usuario.rol != 3) {
		res.redirect('/');
		return;
	}

	grupos.puntos_venta(req.session.usuario.id, (err, pvs) => {
		if (err) {
			next(err);
			return;
		}

		res.render('pvs.njk', {
			usuario: req.session.usuario,
			pvs: pvs
		});
	});
});


/**************************************************
 * POST /pvs/usuarios
 * (Agregar nuevo)
 */
router.post('/usuarios', sup_logged, (req, res) => {
	req.body.cadena = req.session.usuario.cadena;

	async.waterfall([
		(callback) => {	// Generar nueva contraseña
			bcrypt.genSalt(callback);
		},

		(salt, callback) => {	// Genera nueva contraseña encriptada
			bcrypt.hash(req.body.pass, salt, callback);
		},

		(hash, callback) => {	// Guarda el nuevo usuario
			req.body.pass = hash;
			req.body.rol = 4;
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
 * POST /pvs/usuarios/:pv
 * (datatable)
 */
router.post('/usuarios/:pv', sup_logged, (req, res) => {
	req.body.pv = parseInt(req.params.pv);
	usuarios.pvs(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.json(dtr);
	});
});


/*************************************************************************************************/

module.exports = router;
