var db = require("../db");

//define a schema
var Recording = db.model("Recording", {
   zip:      {type: Number},
   airQuality:  {type: Number}
});

module.exports = Recording;
