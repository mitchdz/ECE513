let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let DeviceData = require("../models/deviceData");
let Users = require("../models/users");
let fs = require('fs');
let jwt = require("jwt-simple");


const request = require('request');
global.tempGlobal;
global.humidityGlobal;


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

// router.get('/activities', function(req, res, next){
//   let responseJson = { activities: [] };
//   let id = req.headers["deviceId"];
//   DeviceData.find({deviceId:id}, function(err, activities){
//     if(err){
//       res.status(400).json({success:false, message:"No devices found"});
//     }
//     else{
//       return res.status(200).json(err);
//       for(activity of activities){
//         responseJson.activities.push({"deviceId":activity.deviceId});
//       }
//       res.status(200).json(responseJson);
//     }
//   });
// });

router.get('/activities', function(req, res, next){
  var id = req.headers["device"];
  let responseJson = { activities: [] };
  DeviceData.find({deviceId:id}, function(err, activities){
    if(err){
      res.status(400).json({success:false, message:"No devices found"});
    }
    else{
      for(activity of activities){
        responseJson.activities.push(activity);
      }
      res.status(200).json(responseJson);
    }
  });
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




router.post('/addActivity', function(req, res, next) {
  req.body = JSON.parse(req.body.data); // data is stored in a weird fashion

  // make sure two activities with same date can not be added
  // current causes issue "Cannot set headers after they are sent to the client"
  // let timeQuery = {timeStarted:req.body.time};
  // DeviceData.findOne(timeQuery, function(err, activity) {
  //   if (err) {
  //     return res.status(400).json(err);
  //   }
  //   if (activity) {
  //     return res.status(400).json({succes:"false", message:"activity with start time already exists"});
  //   }
  // });


  var tempLong = req.body.gps_long.trim().split(" ");
  for (var i=0; i<tempLong.length; i++){
    tempLong[i] = Number(tempLong[i]);
  }
  var tempLat = req.body.gps_lat.trim().split(" ");
  for (var i=0; i<tempLat.length; i++){
    tempLat[i] = Number(tempLat[i]);
  }

  let long = tempLong[0];
  let lat = tempLat[0];
  let temp;
  let humidity;


  //get data from weather API
  request('http://api.openweathermap.org/data/2.5/weather?appid=6e5be09cc06697c608c9d8a12dda7698&lat='+lat+'&lon='+long, {json:true},(err, res, body) =>{
    if(err){
      console.log(err);
    }
    else{
      global.tempGlobal = ((Number(body.main.temp)-273.15)*9/5+32).toFixed(2);
      global.humidityGlobal = Number(body.main.humidity);
    }
  });

  var tempSpeed = req.body.gps_speed.trim().split(" ");
  var sumSpeed = 0;
  for(var i=0; i<tempSpeed.length; i++){
    tempSpeed[i] = Number(tempSpeed[i]);
    sumSpeed += tempSpeed[i];
  }

  var tempUV = req.body.uv.trim().split(" ");
  for(var i=0; i<tempUV.length; i++){
    tempUV[i] = Number(tempUV[i]);
  }

  var duration = ((15*tempSpeed.length)/60).toFixed(2);
  var averageSpeed = (sumSpeed/tempSpeed.length).toFixed(2);

  if(averageSpeed < 4){
    var activity = "Walk";
    var calories = (7*duration).toFixed(2);
  }
  else if (averageSpeed < 8){
    var activity = "Run";
    var calories = (13*duration).toFixed(2);
  }
  else{
    var activity = "Bike";
    var calories = (10*duration).toFixed(2);
  }

  var time = new Date();
  var currentTime = time.getTime();

  let newActivity = new DeviceData({
    deviceId:req.body.deviceId,
    gps_long:tempLong,
    gps_lat:tempLat,
    gps_speed:tempSpeed,
    uv:tempUV,
    timeStarted:req.body.time,
    timeAdded:currentTime,
    duration:duration,
    type:activity,
    calories:calories,
    temperature:global.tempGlobal,
    humidity:global.humidityGlobal

  });

  newActivity.save(function(err, newActivity){
    if(err){
      res.status(400).json({success:"false", message:"activity was not saved properly.", err:err});
    }
    else{
      res.status(200).json({success:"true", message:"activity was saved properly."});
    }
  })

});




router.get('/uvThreshold', function(req,res) {
  console.log(req.body, req.query);
  var query = {deviceId:req.query.deviceId};
  Device.findOne(query,function(err, device) {
    if (err) {
      res.status(400).json({success:false, message:"No device with that id exists"});
    }
    var userQuery = {email:device.userEmail};
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


router.put("/replace", function(req, res, next) {
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
  
  var token = req.headers["x-auth"];
  try {
    let decoded = jwt.decode(token, secret);

    let query = {deviceId:req.body.oldId};
    Device.findOne(query, function(err, device) {
      if (err) {
        return res.status(400).json({success:false, message:"Could not find device in database."});
      }
      else if (device) {
        if (!(device.userEmail == decoded.email)) {
          return res.status(400).json({success:false, message:"That device does not belong to the user."});
        }
        device.deviceId = req.body.newId;
        Device.findByIdAndUpdate(device._id, device, function(err, user) {
          if (err) {
             return res.status(400).json(err);
          }
        });

        DeviceData.find(query, function(err, datas) {
          if (err) {
            res.status(400).json({success:false, message:"problem with accessing device data"});
          }
          for (var data of datas) {
            data.deviceId = req.body.newId;
            DeviceData.findByIdAndUpdate(data._id, data, function(err, newData) {
              if (err) {
                res.status(400).json({success:false, message:"problem with writing new device data", err:err});
              }
            });
          }
          res.status(200).json({success:true, message:"updated everything."});
        });

      }
      else {
        res.status(400).json({success:false, message:"issue finding device"});
      }
    });
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