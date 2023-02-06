/**
 * Popsy Pedidos
 * Modelo de categorias
 *
 * Autor: jreyes@joonik.com
 */

const async  = require('async');

let db = require('../db');


/**
 * Consulta todos las categorias del sistema
 */
const lista = (data, callback) => {

    let dtr = {draw: parseInt(data.draw)};

    async.waterfall([
        (cb) => {	// Contar resultados totales
            db('categorias')
                .select(db.raw('COUNT(id) AS total'))
                .asCallback(cb);
        },

        (total, cb) => {	// Busca datos en db
            total = total[0] ? total[0].total : 0;

            dtr.recordsTotal = total;
            dtr.recordsFiltered = total;

            if (total < 1) {
                cb(null, []);
                return;
            }

            db('categorias')
                .orderBy('nombre', 'asc')
                .limit(data.length)
                .offset(parseInt(data.start))
                .asCallback(cb);
        },

        (usuarios, cb) => {
            dtr.data = usuarios;
            cb(null, dtr);
        }

    ], callback);
};


/**
 * Crea una nueva categoria
 * @param {Array} data para guardar
 */
const crear = async (data) => db('categorias', (err, data) => data).insert(data);


/**
 * Obtener un usuario por ID
 * @param {Int} id: ID de usuario a buscar
 */
const obtenerPorId = async (id) => db('categorias', (err, data) => data).where('id', id);


/**
 * Obtener un usuario por ID
 * @param {Int} id: ID de usuario a buscar
 */
const todo = async () => db('categorias', (err, data) => data).orderBy('nombre', 'asc');


/**
 * Actualizar datos del usuario
 * @param {Integer}  data  Datos del requerimiento
 */
const actualizar = (data) => {

    return db('categorias', (err, data) => data)
        .update('nombre', data.nombre)
        .update('habilitado', data.habilitado)
        .where('id', data.id);
};


module.exports = {
	lista,
    crear,
    obtenerPorId,
    actualizar,
    todo
};
