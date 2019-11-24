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
            passwordHash: hash
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


module.exports = router;
