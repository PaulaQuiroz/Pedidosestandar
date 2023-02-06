/**
 * Popsy Pedidos
 * Ruta para configurar las categorias
 *
 * Autor: jreyes@joonik.com
 */

const express = require('express');


// Middlewares
const { permisos, asyncMiddlewareApi, asyncMiddlewareWeb } = require('./middleware');


// Modelos
const categorias = require('../models/categorias');


let router = express.Router();
let acceso = [1];


/**************************
 * GET /categorias
 */
router.get('/', (req, res) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    res.render('categorias/index.njk', {usuario: req.session.usuario});
});


/**************************
 * GET /categorias/agregar
 */
router.get('/agregar', asyncMiddlewareWeb(async (req, res, next) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    res.render('categorias/agregar.njk', {usuario: req.session.usuario});
}));


/**************************
 * GET /categorias/editar
 */
router.get('/editar/:id', asyncMiddlewareWeb(async (req, res, next) => {

    if (!permisos(req, acceso)) { res.redirect('/'); return; }

    const categoriaInfo = await categorias.obtenerPorId(req.params.id);

    res.render('categorias/editar.njk', {
        usuario: req.session.usuario,
        categoria: categoriaInfo[0]
    });
}));


/**************************
 * POST categorias/lista
 */
router.post('/lista', (req, res, next ) => {

    if (!permisos(req, acceso)) { return; }

    categorias.lista(req.body, (err, data) => {
        if (err) {
            res.status(502).json({error: err.message});
            return;
        }

        res.json(data);
    });
});


/**************************
 * POST categorias/clientes/lista
 */
router.post('/clientes/lista/:id_categoria', (req, res, next ) => {

    if (!permisos(req, acceso)) { return; }

    let data = req.body;

    data.id_categoria = req.params.id_categoria;

    clientes.listaPorCategoria(data, (err, data) => {
        if (err) {
            res.status(502).json({error: err.message});
            return;
        }

        res.json(data);
    });
});


/**************************
 * POST categorias/crear
 */
router.post('/crear', asyncMiddlewareApi(async (req, res, next) => {

    if (!permisos(req, acceso)) { return; }

    const crear = await categorias.crear(req.body);

    res.json({success: crear[0]});
}));


/**************************
 * POST categorias/actualizar
 */
router.post('/actualizar', asyncMiddlewareApi(async (req, res, next) => {

    if (!permisos(req, acceso)) { return; }

    const resultados = await categorias.actualizar(req.body);

    res.json({success: resultados});

}));


module.exports = router;