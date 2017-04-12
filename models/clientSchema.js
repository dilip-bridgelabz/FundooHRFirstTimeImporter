/*
 * Client Schema
 * @path models/clientSchema.js
 * @file clientSchema.js
 */
'use strict';

/*
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Base = require('./base'); // Include the base schema

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @schema  ClientSchema
 * @description Client details 
 */
var ClientSchema = new Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    address: {
        type: String,
        trim: true
    },
    contactName: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    contactEmailAddress: {
        type: String,
        trim: true
    },
    clientCity: {
        type: String,
        trim: true
    }
});

/**
 * Expose `ClientModel` Model
 */
module.exports = mongoose.model('client', ClientSchema);
