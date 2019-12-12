var db = require("../db");

var deviceDataSchema = new db.Schema({
    gps_exists: { type: Boolean, required: true },
    gps_speed:  { type: Number, required: true },
    gps_lat:    { type: Number, required: true },
    gps_long:   { type: Number, required: true },
    uv:         { type: Number, required: true },
    time:       { type: Date, required: true },
    deviceId:   { type: String, required: true },
    APIkey:     { type: String, required: true },
});

var DeviceData = db.model("DeviceData", deviceDataSchema);

module.exports = DeviceData;
