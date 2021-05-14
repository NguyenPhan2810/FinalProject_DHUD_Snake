'use strict';

var express = require('express');
var port = process.env.PORT || 1337;

var server = express();
server.use(express.static(__dirname + '/'));
server.listen(port);

