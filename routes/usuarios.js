/**
 * Popsy Pedidos
 * Ruta para administrar usuarios
 *
 * Autor: jreyes@joonik.com
 */

const express = require('express');
const bcrypt  = require('bcrypt');


// Middlewares
const { permisos, asyncMiddlewareApi, asyncMiddlewareWeb } = require('./middleware');


// Modelos
const usuarios      = require('../models/usuarios');
const roles         = require('../models/roles');
const cadenas       = require('../models/cadenas');
const puntosVentas  = require('../models/puntos-venta');


let router = express.Router();
let acceso = [1];


/**************************
 * GET /usuarios
 */
router.get('/', (req, res) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    res.render('usuarios/index.njk', {usuario: req.session.usuario});
});


/**************************
 * GET /usuarios/agregar
 */
router.get('/agregar', asyncMiddlewareWeb(async (req, res, next) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    const listaRoles        = await roles.todo();
    const listaCadenas      = await cadenas.todo();
    const listaPuntosVentas = await puntosVentas.todo();

    res.render('usuarios/agregar.njk', {
        usuario: req.session.usuario,
        roles: listaRoles,
        cadenas: listaCadenas,
        puntosVentas: listaPuntosVentas
    });
}));


/**************************
 * GET /usuarios/editar
 */
router.get('/editar/:id', asyncMiddlewareWeb(async (req, res, next) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    const listaRoles        = await roles.todo();
    const listaCadenas      = await cadenas.todo();
    const listaPuntosVentas = await puntosVentas.todo();
    const usuarioInfo       = await usuarios.obtenerUsuario(req.params.id);

    res.render('usuarios/editar.njk', {
        usuario: req.session.usuario,
        roles: listaRoles,
        cadenas: listaCadenas,
        puntosVentas: listaPuntosVentas,
        infoUsuario: usuarioInfo[0]
    });
}));


/**************************
 * POST usuarios/lista
 */
router.post('/lista', (req, res, next ) => {

    if (!permisos(req, acceso)) { return; }

    usuarios.lista(req.body, (err, data) => {
        if (err) {
            res.status(502).json({error: err.message});
            return;
        }

        res.json(data);
    });
});


/**************************
 * POST usuarios/crear
 */
router.post('/crear', asyncMiddlewareApi(async (req, res, next) => {

    if (!permisos(req, acceso)) { return; }

    bcrypt.genSalt((errSalt, salt) => {

        bcrypt.hash(req.body.pass, salt, async(err, hash) => {

            req.body.pass = hash;

            const crear = await usuarios.crear(req.body);

            res.json({success: crear[0]});
        });
    });
}));


/**************************
 * POST usuarios/actualizar
 */
router.post('/actualizar', asyncMiddlewareApi(async (req, res, next) => {

    if (!permisos(req, acceso)) { return; }

    if (!req.body.pass) {

        const crear = await usuarios.actualizar(req.body);

        res.json({success: crear});
    }
    else {

        bcrypt.genSalt((errSalt, salt) => {

            bcrypt.hash(req.body.pass, salt, async (err, hash) => {

                req.body.pass = hash;

                const crear = await usuarios.actualizar(req.body);

                res.json({success: crear});
            });
        });
    }
}));


/**************************
 * POST usuarios/habilitar
 */
router.post('/habilitar', asyncMiddlewareApi(async (req, res, next) => {
    // Se permiten rol 1 y 2
    if (!permisos(req, [1, 2])) { return; }

    const actualizar = await usuarios.habilitar(req.body);
    res.json({success: actualizar});

}));


module.exports = router;