var jwt = require('jsonwebtoken');
var jwtKey = process.env.JWT_SECRET;

module.exports = function(req){
    const authorizationHeader = req.headers.authorization;
    if(authorizationHeader){
        const token = req.headers.authorization.split(' ')[1];

        return jwt.verify(token, jwtKey, function(err, decoded) {
            if (decoded) {
                return decoded;
            } else {
                return false;
            }
        });
    }
}