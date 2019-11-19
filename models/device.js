var db = require("../devicedb");

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String,
    userEmail:    String,
    lastContact:  { type: Date, default: Date.now }
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
