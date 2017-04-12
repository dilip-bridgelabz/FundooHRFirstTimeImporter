/*
 * User Profile Schema
 * @path models/userProfileSchema.js
 * @file userProfileSchema.js
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('./userSchema').User,
    Base = require('./base'); // Include the base schema

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @schema  UserProfileSchema
 * @description User Profile details
 */
var UserProfileSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
    diploma: {
        type: String,
        trim: true
    },
    degree: {
        type: String,
        trim: true
    },
    discipline: {
        type: String,
        trim: true
    },
    yearOfPassing: {
        type: Date,
        trim: true
    },
    aggregatePercentage: {
        type: Number,
        trim: true
    },
    finalYearPercentage: {
        type: Number,
        trim: true
    },
    trainingInstitute: {
        type: String,
        trim: true
    },
    trainingDuration: {
        type: String,
        trim: true
    },
    trainedIn: {
        type: String,
        trim: true
    }
});

/**
 * Expose `UserProfile` Model
 */
module.exports = mongoose.model('UserProfile', UserProfileSchema);
