/**
 * Popsy Pedidos
 * Ruta para perfil
 *
 * Autor: Armando@Joonik
 */

const express = require('express');
const async = require('async');
const bcrypt = require('bcrypt');

// Modelos
const usuarios = require('../models/usuarios');

// Middlewares
const is_logged = (req, res, next) => {
	if (req.session.usuario) {
		next();
		return;
	}
	res.status(403).json({error: 'Prohibido'});
};

var router = express.Router();


/**************************************************
 * GET /perfil/editar
 */
router.get('/editar', (req, res) => {
	if (!req.session.usuario) {
		res.redirect('/');
		return;
	}

	res.render('perfil-editar.njk', {usuario: req.session.usuario});
});


/**************************************************
 * POST /perfil/pass
 */
router.post('/pass', is_logged, (req, res) => {
	async.waterfall([
		// Busca al usuario
		(callback) => {
			usuarios.login({username: req.session.usuario.username}, callback);
		},

		// Revisa si vino
		(result, callback) => {
			result = result.shift();	// Remueve el elemento del array
			if (result) {
				usuario = result;
				bcrypt.compare(req.body.pass, result.pass, callback);
				return;
			}
			callback(new Error('Usuario inválido'));
		},

		// Revisa si contraseña concuerda y genera nueva contraseña
		(result, callback) => {
			if (result) {
				bcrypt.genSalt(callback);
				return;
			}
			callback(new Error('Contraseña actual inválida'));
		},

		// Genera nueva contraseña encriptada
		(salt, callback) => {
			bcrypt.hash(req.body.nuevo_pass, salt, callback);
		},

		// Cambia la contraseña
		(hash, callback) => {
			usuarios.cambiar_pass(req.session.usuario.username, hash, callback);
		}

	], (err) => {
		if (err) {
			res.status(401).json({error: err.message});
			return;
		}

		res.status(200).end();
	});
});


/**************************************************
 * POST /perfil/restablecer-pass
 */
router.post('/restablecer-pass', (req, res) => {
	if (!req.session.usuario || req.session.usuario.rol > 3) {
		res.status(403).json({error: 'Prohibido'});
		return;
	}

	usuarios.restablecer(parseInt(req.body.id), (err) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		res.end();
	});
});


/*************************************************************************************************/

module.exports = router;
