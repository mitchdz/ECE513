var db = require("../devicedb");

var deviceDataSchema = new db.Schema({
    gps_lat:  Number,
    gps_long: Number,
    uv:       Number,
    visible:  Number,
    ir:       Number,
    time:     Date
});

var DeviceData = db.model("DeviceData", deviceSchema);

module.exports = DeviceData;
