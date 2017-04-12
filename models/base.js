/**
 * @name Base Schema
 * @path models/base.js
 * @file base.js
 * @description This provides all the different models for the various user & other schema in the API
 * Each exchange has slightly different data and organization, so each exchange has its own model
 * Each model uses a schema, which inherits from AbstractSchema
 */
//'use strict';

/*
 * Module dependencies
 */
var bcrypt = require('bcryptjs'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    validate = require('mongoose-validate'),
    util = require('util'),
    mongooseSchemaJSONschema = require('mongoose-schema-jsonschema')(mongoose);

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

// This is the base FundooHR schema
// It's used to add some default functionality to all schemas
// Yay for inheritance!!!
//-----------------------------------------
// First we set up an abstract class that will inherit from Mongoose.Schema
// Then we create a base schema using the abstract class
// Then we create a base model from that base schema
// Then we create derivative schemas using the abstract class constructor to inherit base properties
// And hook up those models using the base model to inherit base behavior
// Inheritance in JS is a PITA!!!

// The base abstract class constructor with base properties
var AbstractSchema = function() {
    Schema.apply(this, arguments); // This is some voodoo with constructor arguments
    this.add({
        // companyID: { // Part of new implementation - 11th April 2017
        //     type: ObjectId,
        //     ref: 'companyID'
        // },
        createdAt: Date,
        createdBy: ObjectId,
        updatedAt: Date,
        updatedBy: ObjectId,
        isDeleted: Boolean,
        deletedAt: Date,
        deletedBy: ObjectId
    });
    // We have to do all the validation this way, since we used 'add()' and not the Schema constructor
    // Note that preOpen and calendar are not required
    this.path('createdAt').default(Date.now);
    this.path('isDeleted').default(false);
};

// Inheritance in Node
util.inherits(AbstractSchema, Schema);
var BaseSchema = new AbstractSchema();

module.exports = {
    BaseModel: mongoose.model('Base', BaseSchema), // Create the base schema & extend some behavior
    BaseSchema: AbstractSchema
};