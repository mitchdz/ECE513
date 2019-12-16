var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:         String,
    deviceId:       { type: String, required: true, unique: true },
    userEmail:      String,
    deviceClaimed:  Boolean,
    lastContact:    { type: Date, default: Date.now }
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
