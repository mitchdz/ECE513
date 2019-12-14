var mongoose = require("mongoose");

mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://localhost/sunrunr", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// mongoose.set('useFindAndModify', false);
module.exports = mongoose;
