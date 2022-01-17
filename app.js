//var fs = require('fs');
var http = require('http');
//var https = require('https'); // use only for https
var express = require("express");
var cors = require('cors')
var bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();

// use only for https
/* var privateKey = fs.readFileSync('sslcert/server.key','utf-8');
var certificate = fs.readFileSync('sslcert/server.crt','utf-8');
var credentials = { key: privateKey, cert: certificate }; */

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/* route */

var authRouter = require('./router/api/auth');
app.use('/auth',authRouter);

var botRouter = require('./router/api/bot');
app.use('/bot',botRouter);

/* route end */

const hostname = process.env.NODE_API_URL || 'localhost';
const port = process.env.NODE_API_PORT || '5000';

const httpServer = http.createServer(app);
httpServer.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// use only for https
/* const httpsServer = https.createServer(credentials,app);
httpsServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`); // make this port different from simple http
}); */