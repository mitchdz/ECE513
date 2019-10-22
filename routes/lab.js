var express = require('express');
var router = express.Router();
var Recording = require("../models/lab.js");

router.get('/status', function(req, res, next){
        var valid_zip = /^\d{5}$/;

        if (!valid_zip.test(req.query.zip)) {
                var errormsg = {"error" : "a zip code is required"};
                res.status(400).send(JSON.stringify(errormsg));
        }
        else {
                var zipID = req.query.zip;
                var query = {"zip":zipID};
                Recording.find(query, function(err, allzipcodes){
                        if(err){
                                var errormsg = { "message" : err};
                                res.status(400).send(JSON.stringify(errormsg));
                        }
                        else {
                                var responseJson = {zips: []};
                                var average = 0;
                                var count = 0;
                                for ( var doc of allzipcodes ){
                                        average += parseFloat(doc.airQuality);
                                        count += 1;
                                }
                                if (count == 0) {
                                        var errormsg = {"error" : "Zip does not exist in database"};
                                        res.status(400).send(JSON.stringify(errormsg));
                                }
                                else {
                                        var realAverage = parseFloat(average/count).toFixed(2);
                                        res.send(realAverage);
                                }
                        }
                });
        }
});

router.post('/register', function(req, res, next) {
	if (!req.body.hasOwnProperty("zip")){
		var errormsg = {"error" : "zip and airQuality are required"};
		res.status(400).send(JSON.stringify(errormsg));
	}
	if (!req.body.hasOwnProperty("airQuality")){
		var errormsg = {"error" : "zip and airQuality are required"};
		res.status(400).send(JSON.stringify(errormsg));
	}
	var newZipcode = new Recording ( {
		zip: req.body.zip,
		airQuality: req.body.airQuality
	});
	newZipcode.save(function(err, newZipcode){
		if (err) {
			var errormessage = {"error" : "zip and airQuality are required."};
			res.status(400).json(errormessage);
		}
		else	{
			var msg = {"response" : "Data recorded."}
			res.status(201).json(msg);
		}
	});
});


module.exports = router;

