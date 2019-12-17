let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let DeviceData = require("../models/deviceData");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }
    else if(!user) {
       res.status(401).json({success : false, message : "Email or password invalid."});         
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
         if (err) {
           res.status(401).json({success : false, message : "Error authenticating. Contact support."});         
         }
         else if(valid) {
            var authToken = jwt.encode({email: req.body.email}, secret);
            res.status(201).json({success:true, authToken: authToken});
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});

/* Register a new user */
router.post('/register', function(req, res, next) {
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         res.status(400).json({success : false, message : err.errmsg, error:"bcryptjs error"});
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
            uvThreshold: 3
        });

        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg, error: "Bad attributes"});
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});
          }
        });
      }
   });
});

router.post('/registerToken', function(req, res, next) {
   // Check for authentication token in x-auth header
   if (!req.body.idtoken) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   return res.status(401).json({success: false, message: req.body.idtoken});

   var authToken = req.body.idtoken;
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      var newUser = new User ({
          email: decodedToken.email,
          fullName: decodedToken.name,
          passwordHash: authToken
      });

      newUser.save(function(err, user) {
        if (err) {
           res.status(400).json({success : false, message : err.errmsg});         
        }
        else {
           res.status(201).json({success : true, message : decodedToken.name + "has been created"});                      
        }
      });

   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

router.put("/updateUv", function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         user.uvThreshold = req.body.uvThreshold;
         User.findByIdAndUpdate(user._id, user, function(err, user) {
            if (err) {
               res.status(400).send(err);
            }
            else if (user) {
               res.sendStatus(204);
            }
            else {
               res.sendStatus(404);
            }
         });
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});


router.put("/updateName", function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         user.fullName = req.body.name;
         User.findByIdAndUpdate(user._id, user, function(err, user) {
            if (err) {
               res.status(400).send(err);
            }
            else if (user) {
               res.sendStatus(204);
            }
            else {
               res.sendStatus(404);
            }
         });
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

// updates email in the user collection, and all devices in the devices collection.
router.put("/updateEmail", function(req, res) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.status(401).json({success: false, message: "No authentication token"});
  }

  if ( !req.body.hasOwnProperty("email")) {
   responseJson.message = "email not sent in body";
   return res.status(400).json(responseJson);
  }

  var authToken = req.headers["x-auth"];

  try {
    var decodedToken = jwt.decode(authToken, secret);
    var originalUser = decodedToken.email;


    // check if the user already exists
    User.findOne({email: req.body.email}, function(err, user) {
       if (user) {
          return res.status(400).json({success: false, message: "user already exists."});
       }
    });

    User.findOne({email: originalUser}, function(err, user) {
       newEmail = req.body.email;
       // update user email in the users db
       user.email = newEmail;
       User.findByIdAndUpdate(user._id, user, function(err, user) {
          if (err) {
             return res.status(400).json(err);
          }
       });
       
       // update device in device db
       Device.find({userEmail: originalUser}, function(err, devices) {
        if (err) {
          res.status(400).json({success:"false", message:"could not locate devices", err:err});
        }
        for (var device in devices) {
          return res.status(400).json(device);
          device.userEmail = newEmail;
          Device.findByIdAndUpdate(device._id, device, function(err, device) {
            if (err) {
              res.status(400).json({success:"false", message:"error updating device", err:err});
            }
          })
          return res.status(200).json({success:"true", message:"updated all devices properly."});
        }
       })


    });
  }
  catch (ex) {
    return res.status(401).json({success: false, message: "Invalid authentication token."});
  }
});



router.put("/updatePassword", function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];


   try {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
         if (err) {
            res.status(400).json({success : false, message : err.errmsg, error:"bcryptjs error"});
         }
         else {
            var decodedToken = jwt.decode(authToken, secret);
            
            User.findOne({email: decodedToken.email}, function(err, user) {
               user.passwordHash = hash;
               User.findByIdAndUpdate(user._id, user, function(err, user) {
                  if (err) {
                     res.status(400).send(err);
                  }
                  else if (user) {
                     res.sendStatus(204);
                  }
                  else {
                     res.sendStatus(404);
                  }
               });
            });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});




router.put("/updateName", function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         user.fullName = req.body.name;
         User.findByIdAndUpdate(user._id, user, function(err, user) {
            if (err) {
               res.status(400).send(err);
            }
            else if (user) {
               res.sendStatus(204);
            }
            else {
               res.sendStatus(404);
            }
         });
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
            userStatus['uvThreshold'] = user.uvThreshold;
            
            // Find devices based on decoded token
		      Device.find({ userEmail : decodedToken.email}, function(err, devices) {
			      if (!err) {
			         // Construct device list
			         let deviceList = []; 
			         for (device of devices) {
				         deviceList.push({ 
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				         });
			         }
			         userStatus['devices'] = deviceList;
			      }
			      
               return res.status(200).json(userStatus);            
		      });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});


// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

router.post("/backDoor" , function(req, res) {
  let user1Email = "test1";
  let user1Pass = user1Email;
  let user1FullName = "test1Name";
  let user1Device1DeviceId = "1";
  let user1Device2DeviceId = "2";
  let user2Email = "test2";
  let user2Pass = user2Email;
  let user2FullName = "test2Name";
  let user2Device1DeviceId = "3";

  var time = new Date();
  var currentTime1     = time.getTime();
  var test1lon         = [-110.941092, -110.941092, -110.941092];
  var test1lat         = [32.2287543, 32.2287543, 32.2287543];
  var test1speed       = [42, 12, 87];
  var test1uv          = [10, 11, 98];
  var test1duration    = ((15*test1speed.length)/60).toFixed(2);
  var test1timestarted = "12/14/2019 16:11:50";
  var test1type        = "walk";
  var test1calories    = "80";
  var test1temperature = 70.9;
  var test1humidity    = 36;

  var currentTime2     = currentTime1+1;
  var test2lon         = test1lon;
  var test2lat         = test1lat;
  var test2speed       = test1speed;
  var test2uv          = test1uv;
  var test2duration    = test1duration;
  var test2timestarted = test1timestarted;
  var test2type        = test1type;
  var test2calories    = test1calories;
  var test2temperature = test1temperature;
  var test2humidity    = test1humidity;

  var currentTime3     = currentTime1+2;
  var test3lon         = [-112.0740, -112.0740, -112.0740];
  var test3lat         = [33.4484, 33.4484, 33.4484];
  var test3speed       = test1speed;
  var test3uv          = test1uv;
  var test3duration    = test1duration;
  var test3timestarted = test1timestarted;
  var test3type        = test1type;
  var test3calories    = test1calories;
  var test3temperature = test1temperature;
  var test3humidity    = test1humidity;

  bcrypt.hash(user1Pass, 10, function(err, hash) {
    if (err) {
       return res.status(400).json({success : false, message : err.errmsg, error:"bcryptjs error"});
    }
    else {
      var newUser = new User ({
          email: user1Email,
          fullName: user1FullName,
          passwordHash: hash,
          uvThreshold: 3
      });
      newUser.save();
    }
  });

  // register new device 1
  Device.find({deviceId:user1Device1DeviceId}, function(err, device) {
    if (device.length == 0) {
      let newKey = getNewApikey();
      let newDevice = new Device({
        deviceId: user1Device1DeviceId,
        userEmail: user1Email,
        apikey: newKey
      });
      newDevice.save();
    }
  });

  // register new device 2
  Device.find({deviceId:user1Device2DeviceId}, function(err, device) {
    if (device.length == 0) {
      let newKey = getNewApikey();
      let newDevice = new Device({
        deviceId: user1Device2DeviceId,
        userEmail: user1Email,
        apikey: newKey
      });
      newDevice.save();
    }
  });

  let newActivity = new DeviceData({
    deviceId: user1Device1DeviceId,
    gps_long:test1lon,
    gps_lat:test1lat,
    gps_speed:test1speed,
    uv:test1uv,
    timeStarted:test1timestarted,
    timeAdded:currentTime1,
    duration:test1duration,
    type:test1type,
    calories:test1calories,
    temperature:test1temperature,
    humidity:test1humidity
  });
  newActivity.save(); 



  bcrypt.hash(user2Pass, 10, function(err, hash) {
    if (err) {
       return res.status(400).json({success : false, message : err.errmsg, error:"bcryptjs error"});
    }
    else {
      var newUser = new User ({
          email: user2Email,
          fullName: user2FullName,
          passwordHash: hash,
          uvThreshold: 3
      });

      newUser.save(function(err, user) {
        if (err) {
           return res.status(400).json({success : false, message : err.errmsg, error: "Bad attributes"});
        }
      });
    }
  });

  // register new device 2
  Device.find({deviceId:user2Device1DeviceId}, function(err, device) {
    if (device.length == 0) {
      let newKey = getNewApikey();
      let newDevice = new Device({
        deviceId: user2Device1DeviceId,
        userEmail: user2Email,
        apikey: newKey
      });
      newDevice.save();
    }
  });


  let newActivity2 = new DeviceData({
    deviceId:    user2Device1DeviceId,
    gps_long:    test2lon,
    gps_lat:     test2lat,
    gps_speed:   test2speed,
    uv:          test2uv,
    timeStarted: test2timestarted,
    timeAdded:   currentTime2,
    duration:    test2duration,
    type:        test2type,
    calories:    test2calories,
    temperature: test2temperature,
    humidity:    test2humidity
  });
  newActivity2.save(); 


  let newActivity3 = new DeviceData({
    deviceId:    user2Device1DeviceId,
    gps_long:    test3lon,
    gps_lat:     test3lat,
    gps_speed:   test3speed,
    uv:          test3uv,
    timeStarted: test3timestarted,
    timeAdded:   currentTime3,
    duration:    test3duration,
    type:        test3type,
    calories:    test3calories,
    temperature: test3temperature,
    humidity:    test3humidity
  });
  newActivity3.save(); 




  return res.status(200);
});


var mandrill = require('node-mandrill')("<your API KEY HERE>"); 
router.post("/api/sendEmail", function(req, res) {
    var _name = req.body.name;
    var _email = req.body.email;
    // var _subject = req.body.subject;
    // var _messsage = req.body.message;

    // sendEmail ( _name, _email, _subject, _message );

    mandrill('/messages/send', {
        message: {
            to: [{email: _email , name: _name}],
            from_email: 'noreply@yourdomain.com',
            subject: "register your sunrunr account!",
            text: "yeet"
        }
    }, function(error, response){
      if (error) {
        res.status(400).json(error);
      }
      else {
        res.status(200).json(response);
      }
    });




});




module.exports = router;
