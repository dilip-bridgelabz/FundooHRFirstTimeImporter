var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    csv = require('csv'),
    mongoose = require('mongoose'),
    path = require('path');

var MongoClient = require('mongodb').MongoClient,
    test = require('assert');

var records = new Array();
var app = express();
var skiprows = ({ 'r': 'Sr. No.' });

var entries = {};
entries.users = [];
entries.personal = [];
entries.HRDdata = [];
entries.BankDetails = [];
entries.TrackingDetails = [];
var MongoURL = 'mongodb://localhost:27017/fundoohrtest1';

exports.list = function(req, res) {
    res.send("FundooHR Import Users Data:</br><a href='users' target='_blank'>Users Data upload</a></br><a href='profile' target='_blank'>Users Profile upload</a></br><a href='hrdata' target='_blank'>Users HR Data upload</a></br><a href='bank' target='_blank'>Users bank upload</a></br><a href='tracking' target='_blank'>Users Tracking upload</a>");
};
exports.user = function(req, res) {
    var stream1 = fs.createReadStream(__dirname + '/upload/FundooHRData - EnggPersonalData.csv');
    var csvStream1 = csv()
        .from.stream(stream1, {
            columns: true
        })
        .on('record', function(row, index) {
            var rowList = Object.values(row);
            var insertData = {};
            var userData = {};
            var userPersonalData = {};
            var insert;
            for (var rowData in row) {
                var column = Object.values(skiprows)[0];
                if (column !== rowData && rowData !== 0) {
                    row[rowData] = row[rowData].trim().trim("'").trim('"');
                    switch (rowData) {
                        case 'Sr. No.':
                            insert = false;
                            break;
                        case 'Engg ID':
                            if (row[rowData] !== '') {
                                insert = true;
                                userData.engineerID = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Name':
                            if (row[rowData] !== '') {
                                fullname = row[rowData].split(/ (.+)/);
                                userData.firstName = fullname[0];
                                userData.lastName = (typeof fullname[1] !== undefined) ? fullname[1] : '';
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Mobile Number':
                            if (row[rowData] !== '') {
                                userData.phone = row[rowData];
                            }
                            break;
                        case 'Email Id':
                            if (row[rowData] !== '') {
                                userData.employee = row[rowData];
                                userData.emailAddress = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Date of Birth':
                            if (row[rowData] !== '') {
                                userPersonalData.dob = row[rowData];
                            }
                            break;
                        case 'Father\'s Name':
                            if (row[rowData] !== '') {
                                if (typeof userPersonalData.engineerRelative === 'undefined')
                                    userPersonalData.engineerRelative = {};
                                userPersonalData.engineerRelative.name = row[rowData];
                            }
                            break;
                        case 'Fathers Mobile Number':
                            if (row[rowData] !== '') {
                                if (typeof userPersonalData.engineerRelative === 'undefined')
                                    userPersonalData.engineerRelative = {};
                                userPersonalData.engineerRelative.contact = row[rowData];
                            }
                            break;
                        case 'Occupation':
                            if (row[rowData] !== '') {
                                if (typeof userPersonalData.engineerRelative === 'undefined')
                                    userPersonalData.engineerRelative = {};
                                userPersonalData.engineerRelative.occupation = row[rowData];
                            }
                            break;
                        case 'Annul Salary Range':
                            if (row[rowData].trim() !== '') {
                                if (typeof userPersonalData.engineerRelative === 'undefined')
                                    userPersonalData.engineerRelative;
                                userPersonalData.engineerRelative.relativesAnnualSalary = row[rowData];
                            }
                            break;
                        case 'Mumbai Address':
                            if (row[rowData].trim() !== '') {
                                userPersonalData.address = row[rowData];
                            }
                            break;
                        case 'Permanent Address':
                            if (row[rowData].trim() !== '') {
                                userPersonalData.permanentAddress = row[rowData];
                            }
                            break;
                    }
                    if (!insert) {
                        break;
                    };
                }
            }
            if (insert && Object.keys(userData).length) {
                if (userData.engineerID !== undefined && userData.engineerID !== '') {
                    //console.log('Inserting row:', insertData.users.engineerID );
                    var objUser = {
                        'user': userData,
                        'personal': userPersonalData
                    }
                    entries.users.push(objUser);
                }
            };
        })
        .on('end', function(count) {
            MongoClient.connect(MongoURL, function(err, db) {
                var userCollection = db.collection("users");
                var userPesrsonalCollection = db.collection("userpersonals");
                var itemsProcessed = 0;
                entries.users.forEach(function(userData, index, array) {
                    userCollection.insert(userData.user, function(err, result) {
                        if (err) {
                            // console.log(err);
                        }
                        if (result) {
                            userData.personal.user = userData.user._id;
                            userPesrsonalCollection.insert(userData.personal, function(err, result) {
                                if (err) {
                                    //console.log(err);
                                }
                                if (result) {}
                            });
                        }
                    });
                    itemsProcessed++;
                    if (itemsProcessed === array.length) {
                        //res.send('Uploaded the User/Personal data');
                    }
                }, this);
            });
            console.log('Number of lines in (FundooHRData - EnggPersonalData.csv): ' + count);
        });
    stream1.pipe(csvStream1);
    res.send('Uploaded the User/Personal data');
};

exports.profile = function(req, res) {
    var stream2 = fs.createReadStream(__dirname + '/upload/FundooHRData - EnggProfile.csv');
    var csvStream2 = csv()
        .from.stream(stream2, {
            columns: true
        })
        .on('record', function(row, index) {
            var rowList = Object.values(row);
            var insertData = {};
            var userProfileData = {};
            var insert;
            for (var rowData in row) {
                var column = Object.values(skiprows)[0];
                if (column !== rowData && rowData !== 0) {
                    row[rowData] = row[rowData].trim().trim("'").trim('"');
                    switch (rowData) {
                        case 'Sr. No.':
                            insert = false;
                            break;
                        case 'Engg ID':
                            if (row[rowData] !== '') {
                                insert = true;
                                userProfileData.engineerID = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Name':
                            if (row[rowData] !== '') {
                                fullname = row[rowData].split(/ (.+)/);
                                userProfileData.firstName = fullname[0];
                                userProfileData.lastName = (typeof fullname[1] !== undefined) ? fullname[1] : '';
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Diploma':
                            if (row[rowData] !== '') {
                                userProfileData.diploma = row[rowData];
                            }
                            break;
                        case 'Degree':
                            if (row[rowData] !== '') {
                                userProfileData.degree = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Discipline':
                            if (row[rowData] !== '') {
                                userProfileData.discipline = row[rowData];
                            }
                            break;
                        case 'Year Passed':
                            if (row[rowData] !== '') {
                                userProfileData.yearOfPassing = row[rowData];
                            }
                            break;
                        case '%Aggr':
                            if (row[rowData] !== '') {
                                userProfileData.aggregatePercentage = row[rowData];
                            }
                            break;
                        case '% Final Year':
                            if (row[rowData] !== '') {
                                userProfileData.finalYearPercentage = row[rowData];
                            }
                            break;
                        case 'Institute':
                            if (row[rowData].trim() !== '') {
                                userProfileData.trainingInstitute = row[rowData];
                            }
                            break;
                        case 'Training':
                            if (row[rowData].trim() !== '') {
                                userProfileData.trainedIn = row[rowData];
                            }
                            break;
                        case 'Training Duration':
                            if (row[rowData].trim() !== '') {
                                userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                    }
                    if (!insert) {
                        break;
                    };
                }
            }
            if (insert && Object.keys(userProfileData).length) {
                if (userProfileData.engineerID !== undefined && userProfileData.engineerID !== '') {
                    //console.log('Inserting row:', insertData.users.engineerID );
                    var objUser = {
                        'userProfileData': userProfileData
                    }
                    entries.personal.push(objUser);
                }
            };
        })
        .on('end', function(count) {
            MongoClient.connect(MongoURL, function(err, db) {
                var userCollection = db.collection("users");
                var userPersonalCollection = db.collection("userprofiles");
                entries.personal.forEach(function(userData, index, array) {
                    userCollection.findOne({ engineerID: userData.userProfileData.engineerID }, function(err, User) {
                        if (err) {
                            console.log(JSON.stringify(err));
                        }
                        if (User) {
                            userData.userProfileData.user = User._id;
                            userPersonalCollection.insert(userData.userProfileData, function(err, result) {
                                if (err) {
                                    console.log(JSON.stringify(err));
                                }
                                if (result) {
                                    console.log(userData.userProfileData._id);
                                }
                            });
                        }
                    });
                }, this);
            });
            console.log('Number of lines in (FundooHRData - EnggProfile.csv) : ' + count);
        });
    stream2.pipe(csvStream2);
    res.send('Uploaded the User Profile data');
};

exports.hrdata = function(req, res) {
    var stream3 = fs.createReadStream(__dirname + '/upload/FundooHRData - EnggHRData.csv');
    var csvStream3 = csv()
        .from.stream(stream3, {
            columns: true
        })
        .on('record', function(row, index) {
            var rowList = Object.values(row);
            var insertData = {};
            var getUserData = {};
            var userHRData = {};
            var insert;
            for (var rowData in row) {
                var column = Object.values(skiprows)[0];
                if (column !== rowData && rowData !== 0) {
                    row[rowData] = row[rowData].trim().trim("'").trim('"');
                    switch (rowData) {
                        case 'Sr. No.':
                            insert = false;
                            break;
                        case 'Engg ID':
                            if (row[rowData] !== '') {
                                insert = true;
                                getUserData.engineerID = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Name':
                            if (row[rowData] !== '') {
                                fullname = row[rowData].split(/ (.+)/);
                                //userHRData.firstName = fullname[0];
                                //userHRData.lastName = (typeof fullname[1] !== undefined) ? fullname[1] : '';
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Hiring City':
                            if (row[rowData] !== '') {
                                userHRData.hiringCity = row[rowData];
                            }
                            break;
                        case 'Fellowship Period':
                            if (row[rowData] !== '') {
                                userHRData.fellowshipPeriod = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'BL Start Date':
                            if (row[rowData] !== '') {
                                userHRData.bridgelabzStartDate = row[rowData];
                            }
                            break;
                        case 'Company Start Date':
                            if (row[rowData] !== '') {
                                userHRData.companyStartDate = row[rowData];
                            }
                            break;
                        case 'Company End Date':
                            if (row[rowData] !== '') {
                                userHRData.companyEndDate = row[rowData];
                            }
                            break;
                        case 'Engg Status':
                            if (row[rowData] !== '') {
                                getUserData.employeeTypes = row[rowData].toUpperCase();
                            }
                            break;
                        case 'Company Calc Start Date':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingInstitute = row[rowData];
                            }
                            break;
                        case 'Engg Contract Initiated':
                            if (row[rowData].trim() !== '') {
                                userHRData.enggContractInitiated = row[rowData];
                            }
                            break;
                        case 'Engg Contract Signed':
                            if (row[rowData].trim() !== '') {
                                userHRData.enggContractSigned = row[rowData];
                            }
                        case 'Comp Contract Initiated':
                            if (row[rowData].trim() !== '') {
                                userHRData.companyContractInitiated = row[rowData];
                            }
                            break;
                        case 'Comp Contract Signed':
                            if (row[rowData].trim() !== '') {
                                userHRData.companyContractSigned = row[rowData];
                            }
                            break;
                        case 'Contract Sign Date':
                            if (row[rowData].trim() !== '') {
                                userHRData.contractSignDate = row[rowData];
                            }
                            break;
                        case 'Initiate Transfer':
                            if (row[rowData].trim() !== '') {
                                userHRData.initiateTransfer = row[rowData];
                            }
                            break;
                        case 'Transfer Status':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Transfer Date':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Required Certificate Submission':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Original Certificates Collected':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Provisional Certificate':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Other Documents':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Orig Returned':
                            if (row[rowData].trim() !== '') {
                                //userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                        case 'Return Details':
                            if (row[rowData].trim() !== '') {
                                // userProfileData.trainingDuration = row[rowData];
                            }
                            break;
                    }
                    if (!insert) {
                        break;
                    };
                }
            }
            if (insert && Object.keys(getUserData).length) {
                if (getUserData.engineerID !== undefined && getUserData.engineerID !== '') {
                    //console.log('Inserting row:', insertData.users.engineerID );
                    var objUser = {
                        'getUserData': getUserData,
                        'userHRData': userHRData
                    }
                    entries.HRDdata.push(objUser);
                }
            };
        })
        .on('end', function(count) {
            MongoClient.connect(MongoURL, function(err, db) {
                var userCollection = db.collection("users");
                var userHRDataCollection = db.collection("userhrdetails");
                var itemsProcessed1 = 0;

                entries.HRDdata.forEach(function(userData, index, array) {
                    userCollection.findOne({ 'engineerID': userData.getUserData.engineerID }, function(err, User) {
                        if (err) {
                            //console.log(err);
                        }
                        if (User) {
                            userCollection.update({ engineerID: userData.getUserData.engineerID }, { $set: { employeeType: userData.getUserData.employeeTypes } }, function(err, UserUpdates) {
                                if (err) {
                                    //console.log(err);
                                }
                                if (UserUpdates) {
                                    //console.log(userData.insertUserData.employeeTypes);
                                }
                            });
                            userData.userHRData.user = User._id;
                            userHRDataCollection.insert(userData.userHRData, function(err, result) {
                                if (err) {
                                    //console.log(err);
                                }
                                if (result) {
                                    // console.log(result);
                                    // console.log(userData.userHRData._id);
                                }
                            });
                        }
                    });
                    itemsProcessed1++;
                    if (itemsProcessed1 === array.length) {
                        //res.send('Uploaded the HR data HR data');
                    }
                }, this);
            });
            console.log('Number of lines in (FundooHRData - EnggHRData.csv): ' + count);
        });
    stream3.pipe(csvStream3);
    res.send('Uploaded the User HR data');
};
exports.bank = function(req, res) {
    var stream4 = fs.createReadStream(__dirname + '/upload/FundooHRData - EnggBankInfo.csv');
    var csvStream4 = csv()
        .from.stream(stream4, {
            columns: true
        })
        .on('record', function(row, index) {
            var rowList = Object.values(row);
            var insertData = {};
            var getUserData = {};
            var userBankDetails = {};
            var insert;
            for (var rowData in row) {
                var column = Object.values(skiprows)[0];
                if (column !== rowData && rowData !== 0) {
                    row[rowData] = row[rowData].trim().trim("'").trim('"');
                    switch (rowData) {
                        case 'Sr. No.':
                            insert = false;
                            break;
                        case 'Engg ID':
                            if (row[rowData] !== '') {
                                insert = true;
                                getUserData.engineerID = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Name':
                            if (row[rowData] !== '') {
                                fullname = row[rowData].split(/ (.+)/);
                                //userHRData.firstName = fullname[0];
                                //userHRData.lastName = (typeof fullname[1] !== undefined) ? fullname[1] : '';
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Bank Account Number':
                            if (row[rowData] !== '') {
                                userBankDetails.accountNumber = row[rowData];
                            }
                            break;
                        case 'IFSC Code':
                            if (row[rowData] !== '') {
                                userBankDetails.ifscCode = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'PAN':
                            if (row[rowData] !== '') {
                                userBankDetails.panNumber = row[rowData];
                            }
                            break;
                        case 'PAY SALARY':
                            if (row[rowData] !== '') {
                                isSalaried = false;
                                if (row[rowData] !== 'undefined') {
                                    if (row[rowData].toUpperCase() === 'YES') {
                                        isSalaried = true;
                                    }
                                }
                                userBankDetails.isSalaried = isSalaried;
                            }
                            break;
                        case 'AMOUNT':
                            if (row[rowData] !== '') {
                                userBankDetails.companyEndDate = row[rowData];
                            }
                            break;
                        case 'Bank Name':
                            if (row[rowData] !== '') {
                                userBankDetails.bankName = row[rowData].toUpperCase();
                            }
                            break;
                        case 'REASON':
                            if (row[rowData].trim() !== '') {
                                userBankDetails.reason = row[rowData].toUpperCase();
                            }
                            break;
                    }
                    if (!insert) {
                        break;
                    };
                }
            }
            if (insert && Object.keys(getUserData).length) {
                if (getUserData.engineerID !== undefined && getUserData.engineerID !== '') {
                    //console.log('Inserting row:', insertData.users.engineerID );
                    var objUser = {
                        'getUserData': getUserData,
                        'userBankDetails': userBankDetails
                    }
                    entries.BankDetails.push(objUser);
                }
            };
        })
        .on('end', function(count) {
            MongoClient.connect(MongoURL, function(err, db) {
                var userCollection = db.collection("users");
                var userBankDetailsCollection = db.collection("userbankdetails");
                var itemsProcessed1 = 0;
                entries.BankDetails.forEach(function(userData, index, array) {
                    userCollection.findOne({ 'engineerID': userData.getUserData.engineerID }, function(err, User) {
                        if (err) {
                            //console.log(err);
                        }
                        if (User) {
                            userData.userBankDetails.user = User._id;
                            userBankDetailsCollection.insert(userData.userBankDetails, function(err, result) {
                                if (err) {
                                    //console.log(err);
                                }
                                if (result) {
                                    // console.log(userData.userBankDetails._id);
                                }
                            });
                        }
                    });
                    itemsProcessed1++;
                    if (itemsProcessed1 === array.length) {
                        //res.send('Uploaded the HR data HR data');
                    }
                }, this);
            });
            console.log('Number of lines in (FundooHRData - EnggBankInfo.csv) : ' + count);
        });
    stream4.pipe(csvStream4);
    res.send('Uploaded the User Bank data ');
};
exports.tracking = function(req, res) {
    var stream5 = fs.createReadStream(__dirname + '/upload/FundooHRData - EnggTrackingInfo.csv');
    var csvStream5 = csv()
        .from.stream(stream5, {
            columns: true
        })
        .on('record', function(row, index) {
            //console.log(row);
            var rowList = Object.values(row);
            var insertData = {};
            var getUserData = {};
            var userTracking = {};
            var insert;
            for (var rowData in row) {
                var column = Object.values(skiprows)[0];
                if (column !== rowData && rowData !== 0) {
                    row[rowData] = row[rowData].trim().trim("'").trim('"');
                    switch (rowData) {
                        case 'Sr. No.':
                            insert = false;
                            break;
                        case 'Engg ID':
                            if (row[rowData] !== '') {
                                insert = true;
                                getUserData.engineerID = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Name':
                            if (row[rowData] !== '') {
                                fullname = row[rowData].split(/ (.+)/);
                                //userHRData.firstName = fullname[0];
                                //userHRData.lastName = (typeof fullname[1] !== undefined) ? fullname[1] : '';
                            } else {
                                insert = false;
                            }
                            break;
                        case 'Tech Stack':
                            if (row[rowData] !== '') {
                                userTracking.techStack = row[rowData];
                            }
                            break;
                        case 'BridgeLabz Start Date':
                            if (row[rowData] !== '') {
                                userTracking.bridgelabzStartDate = row[rowData];
                            } else {
                                insert = false;
                            }
                            break;
                        case 'BridgeLabz End Date':
                            if (row[rowData] !== '') {
                                userTracking.bridgelabzEndDate = row[rowData];
                            }
                            break;
                        case 'Current Week':
                            if (row[rowData] !== '') {
                                userTracking.currentWeek = row[rowData];
                            }
                            break;
                        case '# \nWeeks Left':
                        case '# Weeks Left':
                            if (row[rowData] !== '') {
                                userTracking.weeksLeft = row[rowData];
                            }
                            break;
                    }
                    if (!insert) {
                        break;
                    };
                }
            }
            if (insert && Object.keys(getUserData).length) {
                if (getUserData.engineerID !== undefined && getUserData.engineerID !== '') {
                    var objUser = {
                        'getUserData': getUserData,
                        'userTracking': userTracking
                    }
                    entries.TrackingDetails.push(objUser);
                }
            };
        })
        .on('end', function(count) {
            MongoClient.connect(MongoURL, function(err, db) {
                var userCollection = db.collection("users");
                var userTrackingCollection = db.collection("usertrackings");
                var itemsProcessed1 = 0;
                entries.TrackingDetails.forEach(function(userData, index, array) {
                    userCollection.findOne({ 'engineerID': userData.getUserData.engineerID }, function(err, User) {
                        if (err) {
                            //console.log(err);
                        }
                        if (User) {
                            userData.userTracking.user = User._id;
                            userTrackingCollection.insert(userData.userTracking, function(err, result) {
                                if (err) {
                                    //console.log(err);
                                }
                                if (result) {
                                    // console.log(userData.userTracking._id);
                                }
                            });
                        } else {
                            console.log('No user :' + userData.getUserData.engineerID);
                        }
                    });
                    itemsProcessed1++;
                    if (itemsProcessed1 === array.length) {
                        //res.send('Uploaded the HR data HR data');
                    }
                }, this);
            });
            console.log('Number of lines in (FundooHRData - EnggTrackingInfo.csv) : ' + count);
        });
    stream5.pipe(csvStream5);
    res.send('Uploaded the User Tracking data ');
};