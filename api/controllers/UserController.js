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

                            return res.json(newUser);
                        });
                    }
                });
            }
        });
    }
};
