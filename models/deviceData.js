var db = require("../devicedb");

var deviceDataSchema = new db.Schema({
    gps_exists: { type: boolean, required: true },
    gps_lat:    Number,
    gps_long:   Number,
    uv:         { type: Number, required: true},
    time:       { type: Date, required: true},
    deviceID:   { type: String, required: true },
    APIkey:     { type: String, required: true },
});

var DeviceData = db.model("DeviceData", deviceSchema);

module.exports = DeviceData;
