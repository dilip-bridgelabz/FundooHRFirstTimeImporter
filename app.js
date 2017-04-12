/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    csv = require('csv'),
    mongoose = require('mongoose'),
    path = require('path');

var records = new Array();
var app = express();
var skiprows = ({ 'r': 'Sr. No.' });
var MongoClient = require('mongodb').MongoClient;

var entries = {};
entries.users = [];
entries.personal = [];
entries.HRDdata = [];
entries.BankDetails = [];
entries.TrackingDetails = [];

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/upload/', user.list);
app.get('/upload/users', user.user);
app.get('/upload/profile', user.profile);
app.get('/upload/hrdata', user.hrdata);
app.get('/upload/bank', user.bank);
app.get('/upload/tracking', user.tracking);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});