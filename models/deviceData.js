var db = require("../db");

var deviceDataSchema = new db.Schema({
    gps_speed:  [Number],
    gps_lat:    [Number],
    gps_long:   [Number],
    uv:         [Number],
    timeStarted: Date,
    timeAdded: Number,
    deviceId:   { type: String, required: true },
    APIkey:     String,
    temperature: Number,
    humidity: Number,
    calories: Number,
    type: String,
    duration: Number
});

var DeviceData = db.model("activity", deviceDataSchema);

module.exports = DeviceData;
