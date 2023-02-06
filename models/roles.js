/**
 * Popsy Pedidos
 * Modelo de roles
 *
 * Autor: jreyes@joonik.com
 */


let db = require('../db');


/**
 * Consulta todos los roles del sistema
 */
const todo = async () => {

    return db('roles', (err, data) => data)
        .orderBy('descripcion', 'asc');
};


module.exports = {
	todo
};
