/**
 * Popsy Pedidos
 * Middleware para revisar los permisos de un usuario
 *
 * Autor: jreyes@joonik.com
 */


/**************************************
 * Permisos de la pagina
 */
const permisos = (req, roles) => {

    return req.session.usuario && roles.indexOf(req.session.usuario.rol) > -1
};


/**************************************
 * Async await para api
 */
const asyncMiddlewareApi = fn =>
    (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((err) => res.status(502).json({error: err.message}));
    };


/**************************************
 * Async await para web
 */
const asyncMiddlewareWeb = fn =>
    (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((err) => next(err));
    };



module.exports = {
    permisos,
    asyncMiddlewareApi,
    asyncMiddlewareWeb
};
