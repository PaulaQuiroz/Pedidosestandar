/**
 * Popsy Pedidos
 * Ruta para el login (y logout)
 *
 * Autor: Elsa@Joonik
 */

const express = require('express');
const async = require('async');
const bcrypt = require('bcrypt');

var router = express.Router();

// Modelo
const usuarios = require('../models/usuarios');

// Para verificar si es un explorador antiguo
const is_old = (ua) => {
	// Internet Explorer
	if (ua.indexOf('MSIE') >= 0) {
		return true;
	}

	// Firefox
	if (ua.indexOf('Firefox/') >= 0 && parseInt(ua.match(/Firefox\/(\d+)/).pop()) < 5) {
		return true;
	}

	// Chrome & Safari
	if (ua.indexOf('WebKit/') >= 0 && parseInt(ua.match(/WebKit\/(\d+)/).pop()) < 535) {
		return true;
	}

	return false;
};

/**************************************************
 * GET index
 */
router.get('/', (req, res, next) => {
	if (!req.session.usuario) {
		res.render('login.njk', { ie: is_old(req.headers['user-agent']) });
		return;
	}
	switch (req.session.usuario.rol) {
		case 1:
			res.redirect('/admins');
			break;

		case 2:
			res.redirect('/sups');
			break;

		case 3:
			res.redirect('/pvs');
			break;

		case 4:
			res.redirect('/crear-pedido/' + req.session.usuario.punto_venta);
			break;

		default:
			var err = new Error('Usuario no válido');
			err.status = 403;
			next(err);
	}
});

/**************************************************
 * POST login
 */
router.post('/', (req, res) => {
	var pass = req.body.pass;
	var recordar = typeof req.body.recordar != 'undefined';
	var usuario;

	delete req.body.pass;
	delete req.body.recordar;

	async.waterfall([
		(callback) => {	// Busca al usuario
			usuarios.login(req.body, callback);
		},

		(result, callback) => {	// Revisa si vino
			result = result.shift();	// Remueve el elemento del array
			if (result) {
				usuario = result;
				bcrypt.compare(pass, result.pass, callback);
				return;
			}
			callback('Usuario y/o contraseña inválido(s)');
		},

		(result, callback) => {	// Revisa si contraseña concuerda
			if (result) {
				delete usuario.pass;
				callback(null);
				return;
			}
			callback('Usuario y/o contraseña inválido(s)');
		}
	], (err) => {
		if (err) {
			res.render('login.njk', {
				err: err,
				ie8: req.headers['user-agent'].indexOf('IE 8') >= 0
			});
			return;
		}
		req.session.usuario = usuario;
		if (recordar) {
			req.session.cookie.maxAge = 6048E5;	// Una semana
		}

		res.redirect('/');
	});
});


/**************************************************
 * GET /logout
 */
router.get('/logout', (req, res, next) => {
	req.session.destroy((err) => {
		if (err) {
			next(err);
			return;
		}

		res.redirect('/');
	});
});


/*************************************************************************************************/

module.exports = router;
