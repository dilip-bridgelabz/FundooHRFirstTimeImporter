/*
 * User Schema
 * @path models/userSchema.js
 * @file userSchema.js
 */
'use strict';

/*
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uuid = require("uuid"),
    bcrypt = require('bcrypt-nodejs'),
    // bcrypt = require('bcryptjs'),
    crypto = require('crypto'),
    jwt = require('jwt-simple'),
    passportLocalMongoose = require('passport-local-mongoose'),
    Base = require('./base'), // Include the base schema
    config = require('../config/');

var ObjectId = Schema.Types.ObjectId;

/**
 * @description Defining ENUMs for the gender field which will use for validation.
 */
var genders = ',MALE,FEMALE'.split(',');

/**
 * @description Defining ENUMs for the roles type field which will use for validation.
 */
var roles = 'ADMINISTRATOR,HUMAN RESOURCE,BUSINESS,FINANCE,MENTOR,REVIEWER,EXTERNAL REVIEWER,EMPLOYEE'.split(',');

/**
 * @description Defining ENUMs for the engineer type field which will use for validation.
 */
var employeeTypes = ',TERMINATED,FELLOWSHIP,INTERNSHIP,CONTRACT,PROBATION,EMPLOYEMENT,X-EMPLOYEE'.split(','); // Part of new implementation - 11th April 2017 Desc: FELLOWsHIP,CONTRACT,(PROBATION - Company),(EMPLOYMENT - company),(X-EMPLOYMENT- both),CONSULTANT

/**
 * @schema  UserSchema
 * @description User details
 */
//var UserSchema = new Base.BaseSchema({ // Need to work on the inhertitance.
var UserSchema = new Schema({
    employee: { type: String, unique: true }, // Earlier username, Update of new implementation - 11th April 2017
    engineerID: {
        type: String,
        required: true,
        trim: true,
        unique: ['A user with same Engineer ID {VALUE} already exists']
    },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    firstName: {
        type: String,
        trim: true
    },
    middleName: { // No earlier existance, New implementation - 11th April 2017
        type: String,
        trim: true,
        required: false
    },
    lastName: {
        type: String,
        trim: true,
        required: false
    },
    emailAddress: {
        type: String,
        trim: true,
        lowercase: true,
        unique: ['A user with same Email Address {VALUE} already exists'],
        required: 'Email address is required'
    },
    employeeType: { // Earlier engineerType, Updated - 11th April 2017
        type: String,
        required: ['Engineer Type is required.'],
        default: 'EMPLOYEE', // No earlier existance, employee is set to default EMPLOYEE type, New implementation - 11th April 2017
        enum: {
            values: employeeTypes,
            message: 'Invalid Engineer Type. Please selecet a valid Engineer Type.'
        }
    },
    gender: {
        type: String,
        required: false
    },
    isSuperAdmin: {
        type: Boolean,
        trim: true,
        default: false,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    meta: { // No earlier existance, employee meta may have details which can be added later. New implementation - 11th April 2017
        avatarImg: {
            type: ObjectId,
            ref: 'images',
            required: false
        }
    },
    lastIPAddress: String
});

// var options = ({ missingPasswordError: "Wrong password" });
// UserSchema.plugin(passportLocalMongoose, options);
// UserSchema.plugin(passportLocalMongoose);

/**
 * JWT `Encode` the password
 *
 * @return {String} token
 * @api public
 */
UserSchema.statics.encode = function(data) {
    return jwt.encode(data, config.tokenSecret);
};

/**
 * JWT `Decode` the password
 *
 * @return {String} token
 * @api public
 */
UserSchema.statics.decode = function(data) {
    return jwt.decode(data, config.tokenSecret);
};

/**
 *Create schema methods
 */
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// UserSchema.methods.validPassword = function(password) {
//     return bcrypt.compareSync(password, this.password);
// };

/**
 * Find `User` by its email
 *
 * @param {String} email
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.methods.findByEmail = function(email, cb) {
    return this.findOne({
            emailAddress: email
        })
        .exec(cb);
}


/**
 * Find `User` by its id
 *
 * @param {String} id
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.methods.getUserById = function(id, callback) {
    User.findById(id, callback);
};


/**
 * Find `User` by its username
 *
 * @param {String} username
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.methods.getUserByUsername = function(username, callback) {
    var query = {
        username: username
    };
    User.findOne(query, callback);
};

/**
 * Find `User` by its username and Password
 *
 * @param {String} username
 * @param {String} password
 * @return {Error} err
 * @return {User} user
 * @api public
 */
UserSchema.methods.getUserByUsernameAndPassword = function(query, callback) {
    this.findOne(query, callback);
};


/**
 * createUser `User` by newUser Object
 *
 * @param {Object} newUser
 * @return {Error} err
 * @return Void
 * @api public
 */
UserSchema.methods.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(function(error, data, affected) {
                //console.error(error);
                if (error && error.code !== 11000) {
                    if (error.name == 'ValidationError') {
                        for (var field in error.errors) {
                            return callback(error.errors[field].MongooseError, null);
                        }
                    } else {
                        return callback('Something bad happened. Please contact system administrator', null);
                    }
                }
                //duplicate key
                if (error && error.code === 11000) {
                    //throw new Error('User already registered');

                    //callback('User already registered', null);
                } else {
                    callback(null, data);
                    console.log('Inserted new user');
                }
            });
        });
    });
};

UserSchema.pre('save', function(next) {
    // var user = this;
    // if (!user.isModified('password')) { return next(); }
    // bcrypt.genSalt(10, (err, salt) => {
    //     if (err) { return next(err); }
    //     bcrypt.hash(user.password, salt, null, (err, hash) => {
    //         if (err) { return next(err); }
    //         user.password = hash;
    //         next();
    //     });
    // });
    // var now = new Date().getTime();
    // //this._id = uuid.v1();
    // this.updatedAt = now;
    // if (!this.createdAt) {
    //     this.createdAt = now;
    // }
    next();
});

//var UserModel = Base.BaseModel.discriminator('User', UserSchema);
var UserModel = mongoose.model('User', UserSchema);

/**
 *User Model Utility functions
 */
function findUser(req, res, next) {
    return UserModel.findOne({ 'emailAddress': req.params.emailAddress }, 'emailAddress username',
        function(err, user) {
            if (err) {
                return next(err);
            }
            if (user == null) {
                return res.status(404).json('User does not exists');
            }
            return res.status(200).json(user);
        }
    );
}

function viewAllUsers(req, res, next) {
    return UserModel.find({},
        function(err, users) {
            if (err) {
                return next(err);
            }
            if (users == null) {
                return res.status(404).json('No users');
            }
            return res.json(users);
        }
    );
}

function updateUser(req, res, next) {
    return UserModel.findOne({ 'emailAddress': req.params.emailAddress }, 'emailAddress username password',
        function(err, user) {
            if (err) {
                return next(err);
            }
            if (user == null) {
                return res.status(404).json('User not found in the dBase');
            }
            user.email = req.body.emailAddress || user.emailAddress;
            user.username = req.body.username || user.username;
            user.password = user.generateHash(req.body.password) || user.password;
            user.save(function(err, user) {
                if (err) {
                    return next(err);
                }
                return res.json(user);
            });
        }
    );
}

function deleteUser(req, res, next) {
    return UserModel.findOneAndRemove({ 'emailAddress': req.params.emailAddress }, 'emailAddress username password',
        function(err, user) {
            if (err) {
                return next(err);
            }
            if (user == null) {
                return res.status(404).json('User not found');
            }
            return res.json(user);
        }
    );
}
/**
 * @description Expose `
            User ` Model
 */
module.exports = {
    User: UserModel, //mongoose.model('User', UserSchema);
    UserSchema: UserSchema,
    findUser: findUser,
    viewAllUsers: viewAllUsers,
    updateUser: updateUser,
    deleteUser: deleteUser
};