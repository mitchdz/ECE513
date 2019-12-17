var db = require("../db");

var stagingUserSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
  AuthorizeKey: String,
  timeCreated: Number,
  passwordHash: String
});

var StagingUser = db.model("StagingUser", stagingUserSchema);

module.exports = StagingUser;
