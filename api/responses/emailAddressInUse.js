module.exports = function emailAddressInUse(){

    // Get access to 'res'
    // (since the arguments are up to us)
    var res = this.res;
    return res.send(409, 'La dirección de correo electrónico ya está en uso por otro usuario.')
};
