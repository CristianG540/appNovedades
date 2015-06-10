/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    showHomePage: function (req, res) {

        // Si no esta logueado, se muestra la vista publica.
        if(!req.session.me){
            return res.view('homepage');
        }

        // De lo contrario se busca al usuario logueado y se muestra la vista para los usuarios logueados
        // Se envian los datos basicos del usuario al html desde el servidor

        User.findOne(req.session.me, function foundUser(err, user){
            if(err){ res.negotiate(err); }
            if(!user){
                sails.log.verbose('La secion pertenece a un usuario que ya no existe, por favor trate de refrescar la pagina');
                res.view('homepage');
            }

            return res.view('dashboard', {
                me: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    title: user.title,
                    isAdmin: !!user.admin,
                    gravatarUrl: user.gravatarUrl
                }
            });

        });

    }
};

