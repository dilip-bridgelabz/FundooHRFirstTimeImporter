'use strict';

var config = require('../config/'),
    Base,
    User;

module.exports = {
    init: function(){
        require('./base');
        require('./userSchema');
    }
    , User: require('./userSchema')
    , UserPersonal: require('./userPersonalSchema')
    , UserProfile: require('./userProfileSchema')
    , UserHRDetails: require('./userHRDetailsSchema')
    , UserBank: require('./userBankSchema')
    , UserTracking: require('./userTrackingSchema')
    , UserAttendance: require('./attendanceSchema')
    , ClientCompany: require('./clientSchema')
};
