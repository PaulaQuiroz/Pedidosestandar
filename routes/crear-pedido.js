/**
 * Popsy Pedidos
 * Ruta para Todos menos super admin ➜ Crear pedido
 *
 * Autor: Armando@Joonik
 */

const express = require('express');
const async = require('async');

// Modelos
const puntos_venta = require('../models/puntos-venta');
const grupos = require('../models/grupos');
const usuarios = require('../models/usuarios');

// Middlewares
const is_logged = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.rol > 1) {
		next();
		return;
	}
	res.redirect('/');
};

const { asyncMiddlewareWeb } = require('./middleware');


var router = express.Router();

const mailer = require('nodemailer').createTransport({
	host: '192.168.2.252',
	port: 25,
	secure: false,
	ignoreTLS: true
});

// Expresión regular para revisar si un e-mail es válido
const mail_patt = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

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
 * GET /crear-pedido
 */
router.get('/', is_logged, asyncMiddlewareWeb(async(req, res) => {
	if (req.session.usuario.punto_venta) {
		res.redirect('/crear-pedido/' + req.session.usuario.punto_venta);
		return;
	}
	res.render('crear-pedido-pvs.njk', {usuario: req.session.usuario});
}));


/**************************************************
 * GET /crear-pedido/:pv
 */
router.get('/:pv', is_logged, asyncMiddlewareWeb(async(req, res, next) => {

    const categoria = await usuarios.categoriaUsuario(req.session.usuario.id);

	async.parallel({
		info: (callback) => {
			puntos_venta.info(parseInt(req.params.pv), callback);
		},

		productos: (callback) => {
			puntos_venta.productos(parseInt(req.params.pv), callback);
		}

	}, (err, results) => {
		if (err) {
			next(err);
			return;
		}

		res.render('crear-pedido.njk', {
			usuario: req.session.usuario,
			pv: results.info[0],
			productos: results.productos,
			ie: is_old(req.headers['user-agent']),
            precioHabilitado: categoria
		});
	});
}));


/**************************************************
 * POST /crear-pedido
 * (datatable)
 */
router.post('/', (req, res) => {
	if (!req.session.usuario || !(req.session.usuario.rol & 2)) {
		res.status(403).json({error: 'Prohibido'});
		return;
	}

	if (req.session.usuario.rol === 2) {
		req.body.cadena = parseInt(req.session.usuario.cadena);

	} else {
		req.body.sup = parseInt(req.session.usuario.id);
	}

	grupos.tabla_puntos_venta(req.body, (err, dtr) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}
		res.json(dtr);
	});
});


/**************************************************
 * POST /crear-pedido/:pv
 */
router.post('/:pv', is_logged, (req, res, next) => {
	if (!req.session.usuario || req.session.usuario.rol < 2) {
		res.status(403).json({error: 'Prohibido'});
		return;
	}

	var cnt = 0;

	// Se filtran los productos solicitados cuyas cantidades sean mayor que cero
	for (var key in req.body) {
		var tmp = parseInt(req.body[key]);

		if (tmp && tmp > 0) {
			req.body[key] = tmp;
			cnt++;

		} else {
			delete req.body[key];
		}
	}

	if (!cnt) {
		res.status(502).json({error: 'No se solicitaron productos'});
		return;
	}

	puntos_venta.crear_pedido(parseInt(req.params.pv), req.body, (err, p_id, desc_email) => {
		if (err) {
			res.status(502).json({error: err.message});
			return;
		}

		var text = `El punto de venta "${desc_email.pdv}" realizó el siguiente pedido:
${p_id}
con los siguientes productos:

Descripción		Cantidad
`;
		var html = `<p>El punto de venta "${desc_email.pdv}" realizó el siguiente pedido:<br><strong>${p_id}</strong><br>con los siguientes productos:</p>`;

		html += '<table><thead><tr><th>Descripción</th><th>Cantidad</th></tr></thead><tbody>';

		for (var i = 0; i < desc_email.tabla.length; i++) {
			text += `${desc_email.tabla[i].desc}	${desc_email.tabla[i].cantidad}
`;
			html += `<tr><td>${desc_email.tabla[i].desc}</td><td>${desc_email.tabla[i].cantidad}</td></tr>`;
		}

		html += '</tbody></table>';

		var opts = {
			from: '"Pedidos Popsy" <pedidosweb@heladospopsy.com>',
			to: 'pruebapedidos@heladospopsy.com',
			subject: 'Nuevo Pedido: ' + p_id,
			text: text,
			html: html
		};

		if (mail_patt.test(desc_email.bodega_email)) {
			opts.cc = desc_email.bodega_email;
		}

		mailer.sendMail(opts, (err) => {
			if (err) {
				console.log(err);
			}

			res.send(p_id);
		});
	});
});


/*************************************************************************************************/

module.exports = router;
