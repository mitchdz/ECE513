let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let DeviceData = require("../models/deviceData");
let fs = require('fs');
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.get('/newDevice', function(req, res, next) {
  // get deviceID from req.body.deviceID
  let responseJson = {
    message : "",
  };

  if ( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceID.";
    return res.status(400).json(responseJson);
  }

  let incomingDeviceId = req.body.deviceId;
  
  // check if the deviceID is pending assignment
    // if pending, return generate APIKey
    // if not, die.
});


router.get('/currentActivityId', function(req, res, next) {
  // read a file such that it returns the value, and then updates the value in
  // the file

  let responseJson = {
    message : "",
  };

  if ( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceID.";
    return res.status(400).json(responseJson);
  }

  let incomingDeviceId = req.body.deviceId;

});


router.post('/delete', function(req, res, next) {
  if (!req.body.hasOwnProperty("deviceId")) {
    res.status(400).json({success:false, message:"Missing deviceId"});
  }

  if (!req.headers["x-auth"]) {
    res.status(401).json({success:false, message: "Invalid Credentials"});
  }
  else {
    let token = req.headers["x-auth"];
    try {
      let decoded = jwt.decode(token, secret);
      let query = {id:req.body.deviceId};
      Device.findOne(query, function(err, device) {
        if (err) {
          res.status(400).json({success:false, message:"Could not find device"});
        }
        else if (device) {
          if (device.email == decoded.email) {
            Device.deleteOne({deviceId: req.body.deviceId}, function(err, obj) {
              if(err){
                res.status(400).json({success:false, message:"Could not delete the device"}); 
              }
              res.status(200).json({success:true, message:"Device Deleted."});
            });
          }
          else{
            res.status(400).json({success:false, message:"No device registered with that device id."});
          }
        }
        else {
          res.status(400).json({success:false, message: "no error, but device not returned"});
        }
      });

    }
    catch(ex) {
      res.stauts(401).json({success:false, message:"error decoding jwt"});
    }
  }

});



router.get('/uvThreshold', function(req,res) {
  var query = {id:req.query.id};
  Devices.findOne(query,function(err, device) {
    if (err) {
      res.status(400).json({success:false, message:"No device with that id exists"});
    }
    var userQuery = {email:device.email};
    Users.findOne(userQuery, function(err, user) {
      if (err) {
        res.status(400).json({success:false, message:"User could not be found."});
      }
      else {
        var response = user.uvThreshold
        res.status(200).json({message:response});
      }
    })
  })
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

router.get('/getData', function(req, res, next) {
  let responseJson = { data: [] };
  DeviceData.find({}, function(err, allData) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let dev of allData) {
        responseJson.data.push({ "deviceId": dev.deviceId,  
                                    "gps_exists" : dev.gps_exists,
                                    "gps_speed": dev.gps_speed,
                                    "gps_lat": dev.gps_lat,
                                    "gps_long": dev.gps_long,
                                    "uv": dev.uv,
                                    "time": dev.time,
                                    "deviceId": dev.deviceId,
                                    "APIkey": dev.APIkey
                                    });
      }
    }

    res.status(200).json(responseJson);
  });

});


// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceId = req.params.devid;
  let responseJson = { devices: [] };

  if (deviceId == "all") {
    let query = {};
  }
  else {
    let query = {
      "deviceId" : deviceId
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
});

router.post('/deviceData', function(req, res, next) {
    let responseJson = {
        removed: false,
        deviceId : "none",
        message : "",
    };

    let incoming = JSON.parse(req.body.data);

    if ( !incoming.hasOwnProperty("gps_exists")) {
        responseJson.message = "Missing gps_exists.";
        return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("gps_speed")) {
      responseJson.message = "Missing gps_speed.";
      return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("gps_lat")) {
        responseJson.message = "Missing gps_lat.";
        return res.status(400).json(responseJson);
    }
    if ( !incoming.hasOwnProperty("gps_long")) {
        responseJson.message = "Missing gps_long.";
        return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("uv")) {
        responseJson.message = "Missing uv.";
        return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("time")) {
        responseJson.message = "Missing time.";
        return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }

    if ( !incoming.hasOwnProperty("APIkey")) {
        responseJson.message = "Missing APIkey.";
        return res.status(400).json(responseJson);
    }

    if (incoming.gps_exists) {
        let gps_lat = incoming.gps_location;
        let gps_long = incoming.gps_long;
    }

    // Create a new device with specified id, user email, and randomly generated apikey.
    let newDeviceData = new DeviceData({
        gps_exists: incoming.gps_exists,
        gps_speed: incoming.gps_speed,
        gps_lat: incoming.gps_lat,
        gps_long: incoming.gps_long,
        uv: incoming.uv,
        time: incoming.time,
        deviceId: incoming.deviceId,
        APIkey: incoming.APIkey
    });

    // Save device. If successful, return success. If not, return error message.
    newDeviceData.save(function(err, newDevice) {
    if (err) {
      responseJson.message = err;
      // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
      return res.status(400).json(responseJson);
    }
    else {
      responseJson.removed = true;
      responseJson.deviceId = req.body.deviceId;
      responseJson.message = "Device ID " + req.body.deviceId + " data was saved.";
      return res.status(201).json(responseJson);
    }
    });

});


router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };
  let deviceExists = false;
  
  // Ensure the request includes the deviceId parameter
  if( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
       deviceApikey = getNewApikey();
        
        // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceId: req.body.deviceId,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceId = req.body.deviceId;
          responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});


router.post('/replace', function(req, res, next) {


    let responseJson = {
        success: false,
        message : "",
    };
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("oldId")) {
        responseJson.message = "Missing oldId.";
        return res.status(400).json(responseJson);
    }

    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("newId")) {
        responseJson.message = "Missing newId.";
        return res.status(400).json(responseJson);
    }    
    
    try {
      let decoded = jwt.decode(token, secret);




      // let query = {id:req.body.deviceId};
      // Device.findOne(query, function(err, device) {
      //   if (err) {
      //     res.status(400).json({success:false, message:"Could not find device"});
      //   }
      //   else if (device) {
      //     if (device.email == decoded.email) {
      //       Device.deleteOne({deviceId: req.body.deviceId}, function(err, obj) {
      //         if(err){
      //           res.status(400).json({success:false, message:"Could not delete the device"}); 
      //         }
      //         res.status(200).json({success:true, message:"Device Deleted."});
      //       });
      //     }
      //     else{
      //       res.status(400).json({success:false, message:"No device registered with that device id."});
      //     }
      //   }
      //   else {
      //     res.status(400).json({success:false, message: "no error, but device not returned"});
      //   }
      // });
    }
    catch(ex) {
      res.status(401).json({success:false, message:"error decoding jwt"});
    }


});



router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message : "",
    };
    let deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
    
    // If authToken provided, use email in authToken 
    try {
        let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/pingDevice",
       form: {
           access_token : particleAccessToken,
           args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " pinged.";
    return res.status(200).json(responseJson);
});

module.exports = router;