/*
 * User Tracking Schema
 * @path models/userTrackingSchema.js
 * @file userTrackingSchema.js
 */
'use strict';

/*
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('./userSchema').User,
    Base = require('./base'); // Include the base schema

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @schema UserTrackingSchema
 * @description Tracking details for the user
 */
var UserTrackingSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
    techStack: {
        type: String,
        trim: true
    },
    bridgelabzStartDate: {
        type: Date,
        trim: true
    },
    bridgelabzEndDate: {
        type: Date,
        trim: true
    },
    currentWeek: {
        type: Number,
        trim: true
    },
    weeksLeft: {
        type: Number,
        trim: true
    }
});

/**
 * Expose `UserTracking` Model
 */
module.exports = mongoose.model('UserTracking', UserTrackingSchema);
