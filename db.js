/**
 * Popsy Pedidos
 * MySQL pool
 *
 * Autor: Armando@Joonik
 */

var opts = {
	client: 'mysql',
	connection: {
		host: process.env.MYSQL_HOST || 'localhost',
		port: process.env.MYSQL_PORT || 8889,
		user: process.env.MYSQL_USER || 'root',
		password: process.env.MYSQL_PASS || 'root',
		database: process.env.MYSQL_DB || 'popsy_2'
	},
	pool: {
		min: 0,
		max: 100
	}
};

if (process.env.NODE_ENV === 'production') {
	opts.connection.trace = false;
}

module.exports = require('knex')(opts);
