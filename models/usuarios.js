/**
 * Popsy Pedidos
 * Modelo de usuarios
 *
 * Autor: Armando@Joonik
 */

const async  = require('async');
const bcrypt = require('bcrypt');

let db          = require('../db'),
    categorias  = require('./categorias');



// Queries constantes
const query_admins_cadena = (data) => {
	return db('usuarios')
	.where({
		rol: 2,
		cadena: data.cadena
	});
};

const query_sups_grupo = (data) => {
	const query = db('usuarios').where({ rol: 3, cadena: data.cadena });
	if (data.segmento) {
		query.where('segmento', data.segmento)
	}
	return query;
};

const query_pvs = (data) => {
	return db('usuarios')
	.where({
		rol: 4,
		punto_venta: data.pv
	});
};


/**************************************************
 * Métodos del modelo a exportar
 */


/**************************************************
 * Ingreso de un usuario
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto de usuario encontrado)
 */
const login = (data, callback) => {
	db('usuarios').select('id', 'username', 'pass', 'nombre', 'rol', 'cadena', 'punto_venta', 'segmento').where('username', data.username).where('habilitado', 1).asCallback(callback);
};


/**************************************************
 * Lista de administradores por cadena
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const admins_cadena = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {	// Contar resultados totales
			query_admins_cadena(data)
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

            const query = db('usuarios')
			    .select(
			        'usuarios.id',
                    'usuarios.username',
                    'usuarios.nombre',
                    'usuarios.descripcion',
                    'usuarios.habilitado',
                    'categorias.nombre AS categoria'
                )
                .leftJoin('categorias','usuarios.categoria_id','categorias.id')
                .where('usuarios.rol',2)
                .where('usuarios.cadena', data.cadena)

            if (typeof data.segmento != "undefined") {
            	query.where('usuarios.segmento', parseInt(data.segmento));
            }
            query.limit(data.length).offset(parseInt(data.start)).asCallback(cb);
		},

		(usuarios, cb) => {
			dtr.data = usuarios;
			cb(null, dtr);
		}

	], callback);
};


/**************************************************
 * Agregar nuevo usuario
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error)
 */
const agregar_usuario = (data, callback) => {
	async.waterfall([
		// Revisa si nombre de usuario ya existe
		(cb) => {
			db('usuarios').select('id').where('username', data.username).asCallback(cb);
		},

		// Inserta nuevo usuario
		(usuario, cb) => {
			usuario = usuario.shift();

			if (usuario) {
				cb(new Error('Usuario ya existe'));
				return;
			}

			if (data.punto_venta) {
				data.punto_venta = parseInt(data.punto_venta);
			}

			if (data.segmento) {
				data.segmento = parseInt(data.segmento);
			} else {
				delete data.segmento;
			}

			db('usuarios').insert(data).asCallback(cb);
		},

		// Retorna el Id del usuario insertado
		(ignore, cb) => {
			db.select(db.raw('LAST_INSERT_ID() AS id')).asCallback(cb);
		}

	], callback);
};


/**************************************************
 * Lista de supervisores de grupo
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const sups_grupo = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {	// Contar resultados totales
			query_sups_grupo(data)
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

			query_sups_grupo(data)
			.select('id', 'username', 'nombre', 'descripcion', 'habilitado')
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


/**************************************************
 * Info de un usuario de acuerdo a su id
 * @param {Object}   id       Id del usuario
 * @param {Function} callback Función retorno (error, objeto de usuario)
 */
const info = (id, callback) => {
	db('usuarios').select('username', 'nombre', 'descripcion').where('id', id).asCallback(callback);
};


/**************************************************
 * Lista de usuarios de punto de venta por supervisor de grupo
 * @param {Object}   data     Objeto de parámetros
 * @param {Function} callback Función retorno (error, objeto para datatables)
 */
const pvs = (data, callback) => {
	var dtr = {draw: parseInt(data.draw)};

	async.waterfall([
		(cb) => {	// Contar resultados totales
			query_pvs(data)
			.select(db.raw('COUNT(usuarios.id) AS total'))
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

			query_pvs(data)
			.select('usuarios.id', 'usuarios.username', 'usuarios.nombre', 'usuarios.descripcion', 'usuarios.habilitado')
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
 * Cambia contraseña de usuario
 * @param {String}   username
 * @param {String}   pass
 * @param {Function} callback Función retorno (error)
 */
const cambiar_pass = (username, pass, callback) => {
	db('usuarios')
	.update('pass', pass)
	.where('username', username)
	.asCallback(callback);
};


/**
 * Restablece la contraseña de usuario a la por defecto (popsy2016)
 * @param {Integer}  id       Id del usuario
 * @param {Function} callback Función retorno (error)
 */
const restablecer = (id, callback) => {
	db('usuarios')
	.update('pass', '$2a$10$ca7pHWgnz2VbUjDsJQTNR.aIPQoWxOE3qfAAj0vK3irr/HttWIkha')
	.where('id', id)
	.asCallback(callback);
};


/**
 * Consulta todos los usuarios del sistema
 */
const lista = (data, callback) => {

    let dtr = {draw: parseInt(data.draw)};

    async.waterfall([
        (cb) => {	// Contar resultados totales
            db('usuarios')
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

            db('usuarios')
                .select(
                    'usuarios.id',
                    'usuarios.username',
                    'usuarios.email',
                    'usuarios.nombre',
                    'usuarios.descripcion',
                    'usuarios.habilitado',
                    'usuarios.habilitado AS estado',
                    'roles.descripcion AS rol'
                )
                .innerJoin('roles', 'usuarios.rol', 'roles.id')
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
 * Verifica si el email ya existe
 * @param {String} email  Correo electronico del usuario
 */
const emailExiste = async (email) => {

    return db('usuarios', (err, data) => data)
        .where('email', email);
};


/**
 * Generar salt
 */
const generarSalt = async () => {

    bcrypt.genSalt((err, salt) => {
        return salt;
    });
};


/**
 * Encripta contraseña
 * @param {String} clave  Contraseña que se desea encriptar
 */
const enciptarClave = async (clave) => {

    return bcrypt.hash(clave, salt, (err, hash) => hash);
};


/**
 * Crea un nuevo usuario
 * @param {Array} data para guardar
 */
const crear = async (data) => {

    if (data.email) {

        let existeEmail = await emailExiste(data.email);

        if (existeEmail.length) {
            return [0];
        }

        return db('usuarios', (err, data) => data).insert(data);
    }
    else {

        return [0];
    }
};


/**
 * Obtener un usuario por ID
 * @param {Int} id: ID de usuario a buscar
 */
const obtenerUsuario = async (id) => {

    return db('usuarios', (err, data) => data)
        .where('id', id);
};


/**
 * Actualizar datos del usuario
 * @param {Integer}  data  Datos del requerimiento
 */
const actualizar = (data) => {

    let usuario = db('usuarios', (err, data) => data)
        .update('username', data.username)
        .update('email', data.email)
        .update('nombre', data.nombre)
        .update('descripcion', data.descripcion)
        .update('habilitado', data.habilitado)
        .update('rol', data.rol)
        .update('cadena', data.cadena)
        .update('punto_venta', data.punto_venta);

    if (data.pass) {
        usuario = usuario.update('pass', data.pass);
    }

    return usuario.where('id', data.id);
};

/**
 * Activar - Desactivar usuario
 * @param {Integer}  data  Datos del requerimiento
 */
const habilitar = ({id, habilitado}) => {
    let usuario = db('usuarios', (err, data) => data)
        .update('habilitado', habilitado)

    return usuario.where('id', id);
};


/**
 * Obtener si esta habilitado el usuario para ver el precio
 * @param {Int} id: ID de usuario a buscar
 */
const categoriaUsuario = async (id) => {

    const usuarioDB = await obtenerUsuario(id);

    if (usuarioDB[0].categoria_id && usuarioDB[0].categoria_id > 0) {

        const categoria = await categorias.obtenerPorId(usuarioDB[0].categoria_id);

        return categoria.length && categoria[0].habilitado === 'S';
    }
    else {
        return false;
    }
};

/*************************************************************************************************/

module.exports = {
	login: login,
	admins_cadena,
	agregar_usuario: agregar_usuario,
	sups_grupo: sups_grupo,
	info: info,
	pvs: pvs,
	cambiar_pass: cambiar_pass,
	restablecer: restablecer,
	lista,
    crear,
    emailExiste,
    obtenerUsuario,
    actualizar,
    categoriaUsuario,
    habilitar,
};
