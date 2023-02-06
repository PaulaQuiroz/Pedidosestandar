/**
 * Popsy Pedidos
 * Ruta para Admin de cadena ➜ Supervisores
 *
 * Autor: Armando@Joonik
 */

const express = require('express');
const async = require('async');
const bcrypt = require('bcrypt');

// Modelos
const cadenas = require('../models/cadenas');
const usuarios = require('../models/usuarios');
const puntos_venta = require('../models/puntos-venta');
const grupos = require('../models/grupos');

// Middlewares
const is_logged = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.rol == 2) {
		next();
		return;
	}
	res.redirect('/');
};

const admin_logged = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.rol == 2) {
		next();
		return;
	}
	res.status(403).json({error: 'Prohibido'});
};

var router = express.Router();


/**************************************************
 * GET /sups
 */
router.get('/', is_logged, (req, res) => {
	res.render('sups.njk', {usuario: req.session.usuario});
});


/**************************************************
 * POST /sups/sups-grupo
 * (datatable)
 */
router.post('/sups-grupo', admin_logged, (req, res) => {
	req.body.cadena = req.session.usuario.cadena;
	req.body.segmento = req.session.usuario.segmento;
	usuarios.sups_grupo(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});


/**************************************************
 * GET /sups/:id
 */
router.get('/:id', is_logged, (req, res, next) => {
	usuarios.info(parseInt(req.params.id), (err, sup) => {
		if (err) {
			next(err);
			return;
		}
		res.render('sups-pvs.njk', {
			usuario: req.session.usuario,
			sup: sup.shift()
		});
	});
});


/**************************************************
 * POST /sups
 * (Agregar nuevo)
 */
router.post('/', admin_logged, (req, res) => {
	req.body.cadena = req.session.usuario.cadena;

	if (req.session.usuario.segmento) req.body.segmento = req.session.usuario.segmento;

	async.waterfall([
		(callback) => {	// Generar nueva contraseña
			bcrypt.genSalt(callback);
		},

		(salt, callback) => {	// Genera nueva contraseña encriptada
			bcrypt.hash(req.body.pass, salt, callback);
		},

		(hash, callback) => {	// Guarda el nuevo usuario
			req.body.pass = hash;
			req.body.rol = 3;
			usuarios.agregar_usuario(req.body, callback);
		}

	], (err, lid) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.send('' + lid[0].id);
	});

});


/**************************************************
 * POST /sups/activar
 */
router.post('/activar', admin_logged, (req, res) => {
	req.body.cadena = req.session.usuario.cadena;
	grupos.activar(req.body, (err) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.end();
	});
});


/**************************************************
 * POST /sups/:id
 * (datatable)
 */
router.post('/:id', admin_logged, (req, res) => {
	req.body.cadena = req.session.usuario.cadena;
	req.body.sup = parseInt(req.params.id);
	puntos_venta.tabla_grupo(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});


/*************************************************************************************************/

module.exports = router;
