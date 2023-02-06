/**
 * Popsy Pedidos
 * Archivo principal, inicio del servidor web
 *
 * Autor: Elsa@Joonik
 */

const http = require('http');

var app = require('./app');

/*************************************************************************************************/

/**
 *  terminator === the termination handler
 *  Terminate server on receipt of the specified signal.
 *  @param {string} sig  Signal to terminate on.
 */
const terminator = (sig) => {
	if (typeof sig === 'string') {
		console.log('\n%s: Received %s - terminating server...', Date(Date.now()), sig);
		process.exit(1);
	}

	else {
		console.log('%s: Node server stopped.', Date(Date.now()) );
	}
}

/**
 *  Setup termination handlers (for exit and a list of signals).
 */
//  Process on exit and signals.
process.on('exit', terminator);

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach((element, index, array) => {
	process.on(element, () => { terminator(element); });
});

/*************************************************************************************************/

/**
 * Get port from environment and store in Express.
 */

var port = process.env.NODE_PORT || 4008;

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Attach sockets
 */
require('./sockets')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

/**
 * Listen for HTTP server "error" event.
 */

server.on('error', (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});

/**
 * Listen for HTTP server "listening" event.
 */

server.on('listening', () => {
var info = `Servidor de pedidos Popsy escuchando en puerto ${port}`;
	if (process.env.NODE_ENV) {
		info += ` (${process.env.NODE_ENV.toUpperCase()})`;
	}
	console.log(info);
});
