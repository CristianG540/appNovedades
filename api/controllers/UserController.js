/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Passwords = require('machinepack-passwords');
var Gravatar = require('machinepack-gravatar');
module.exports = {
    /**
     * Sign up fo user account
     */
    signup: function (req, res) {
        var password = req.body.password;

        // Encrypt a string using the BCrypt algorithm.
        Passwords.encryptPassword({
            password: password,
        }).exec({
            error: function (err) {
                return res.negotiate(err);
            },
            success: function (encryptedPassword) {
                // Build the URL of a gravatar image for a particular email address.
                Gravatar.getImageUrl({
                    emailAddress: req.param('email'),
                }).exec({
                    error: function (err) {
                        return res.negotiate(err);
                    },
                    success: function (gravatarUrl) {
                        var data = {
                            name: req.param('name'),
                            title: req.param('title'),
                            email: req.param('email'),
                            encryptedPassword : encryptedPassword,
                            lastLoggedIn: new Date(),
                            gravatarUrl: gravatarUrl
                        };
                        // Crete a User with the params sent from
                        // the sign-up form --> signup.ejs
                        User.create( data, function userCreated(err, newUser){
                            if(err){
                                // If this is a uniqueness error about the email attribute,
                                // send back an easily parseable status code.
                                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.email[0].rule === 'unique') {
                                    return res.emailAddressInUse();
                                }
                                return res.negotiate(err);
                            }

                            req.session.me = newUser.id;

                            return res.json(newUser);
                        });
                    }
                });
            }
        });
    },

    /**
     * Comprueba el email y el password, y si coinciden con un usuario en la base de datos,
     * lo loguea en la aplicacion
     */
    login: function(req, res) {

        // intenta buscar un usuario con un email indicado
        User.findOne({
            email: req.param('email')
        }, function foundUser(err, user){
            if(err){ res.negotiate(err) };
            if(!user){ res.notFound() };

            // Compara el password ingresado por el usuario
            // con el password encriptado en la base de datos
            Passwords.checkPassword({
                passwordAttempt: req.param('password'),
                encryptedPassword: user.encryptedPassword
            }).exec({
                error: function (err){
                    return res.negotiate(err);
                },
                // Si el password ingresado en el formulario no coincide con el
                // el password encriptado en la base de datos
                incorrect: function (){
                    return res.notFound();
                },
                success: function(){
                    // Guardo el id del usuario en la secion
                    req.session.me = user.id;

                    return res.ok();
                }
            });
        });
    },

    /**
     * Cierra la secion de la aplicacion
     */
    logout: function(req, res){

        // Se busca el registro en la base de datos q coincida con el
        //  id de usuario de la secion
        User.findOne(req.session.me, function foundUser(err, user){
            if(err){ res.negotiate(err) };
            if(!user){
                sails.log.verbose('La secion pertenece a un usuario que ya no existe, por favor trate de refrescar la pagina');
                res.backToHomePage();
            }

            req.session.me = null;

            res.backToHomePage();
        })
    }
};
