/**
 * Popsy Pedidos
 * Archivo para configuración de app express
 *
 * Autor: Elsa@Joonik
 */

const express = require('express');
const session = require('express-session');

var app = express();

// Info de sesión
var sess = {
	name: 'popsy-pedidos',
	secret: 'YVvn=&?R',
	resave: false,
	saveUninitialized: false,
	unset: 'destroy'
};

// Usar sesión persistente
var SQLiteStore = require('connect-sqlite3')(session);
sess.store = new SQLiteStore;

// Usar compresión y favicon en producción
if (app.get('env') === 'production') {
	app.set('trust proxy', 1);	// Confiar en primer proxy
	sess.cookie = {secure: true};	// Servir cookies seguras (asumiendo que producción es https)

	app.use(require('compression')());
	app.use(require('serve-favicon')(require('path').join(__dirname, 'public', 'favicon.ico')));

} else {	// Logger si es otro ambiente
	app.use(require('morgan')('dev'));
}

// Parser para las peticiones POST con x-www-form-urlencoded
app.use(require('body-parser').urlencoded({ extended: false }));

// Usar sesión en app
app.use(session(sess));

// Servir carpeta public
app.use(express.static(__dirname + '/public'));

// Configuración del motor de vistas
require('nunjucks').configure('views', {
	autoescape: false,
	trimBlocks: true,
	lstripBlocks: true,
	noCache: true,
	watch: true,
	express: app
});

// Rutas
app.use('/', require('./routes/login'));

// Rutas para superadmin
app.use('/admins', require('./routes/admins'));
app.use('/bodegas', require('./routes/bodegas'));
app.use('/productos', require('./routes/productos'));
app.use('/importar', require('./routes/importar'));
app.use('/perfil', require('./routes/perfil'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/categorias', require('./routes/categorias'));

// Rutas para admins de cadena
app.use('/sups', require('./routes/sups'));
app.use('/pedidos', require('./routes/pedidos'));
app.use('/crear-pedido', require('./routes/crear-pedido'));

// Rutas para supervisores de grupo
app.use('/pvs', require('./routes/pvs'));

// Rutas para puntos de venta

// Si hay 404 lo envía al manejador de errores
app.use((req, res, next) => {
	var err = new Error('No Encontrado');
	err.status = 404;
	next(err);
});

// Manejador de errores
// Mostrará el stack trace si no se está en producción
app.use((err, req, res, next) => {
	var info = {
		message: err.message,
		status: err.status
	};

	if (app.get('env') !== 'production') {
		info.stack = err.stack;
	}

	res.status(err.status || 500);
	res.render('error.njk', info);
});


module.exports = app;
