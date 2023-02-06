/**
 * Popsy Pedidos
 * Middleware para revisar si está logueado (POST)
 *
 * Autor: Armando@Joonik
 */

module.exports = (req, res, next) => {
	if (req.session.usuario && req.session.usuario.rol == 1) {
		next();
		return;
	}
	res.status(403).json({error: 'Prohibido'});
};
