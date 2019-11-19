var db = require("../devicedb");

var deviceDataSchema = new db.Schema({
    gps_exists: { type: boolean, required: true },
    gps_lat:    { type: Number, required: true },
    gps_long:   { type: Number, required: true },
    uv:         { type: Number, required: true },
    time:       { type: Date, required: true },
    deviceId:   { type: String, required: true },
    APIkey:     { type: String, required: true },
});

var DeviceData = db.model("DeviceData", deviceSchema);

module.exports = DeviceData;
