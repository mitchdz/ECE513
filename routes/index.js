var express = require('express');
var router = express.Router();


router.get("/shipping", function(req, res, next) {
	// Shipping rates for various carries.                                                                                          
	// Array entries are costs for same-day, 
	// 1-day, 2-day, 3-day, and 4+ day shipping                                               
	// "na" means the shipping is not available                                                                                     
	var shippingRates = {
	    ups: ["na", 72.50, 45.90, 25.12, 9.45],
	    usps: ["na", "na", 40.16, 15.25, 4.65],
	    fedex: [50.45, 65.25, 50.10, 29.80, 11.45],
	    amazon: [19.99, 3.99, 0.00, 0.00, 0.00]
	};

	// TODO: If the service property is not defined in the query string,
	// is an empty string, or is a number greater than 4, return 
	// a response code of 400 and JSON with an error property with a 
	// descriptive error message
	if (!req.query.hasOwnProperty("service") || req.query.service == "" || req.query.service > 4) {
	   var errorMsg = {
		   error: "Shipping service type is invalid or missing"
	   }
	   res.status(400).send(JSON.stringify(errorMsg));

	   return;
	}

	// Initial object for response
	var shippingCosts = { costs: {} };

	// TODO: If carrier is specified return costs just for that carrier. 
	// Otherwise, return costs for all carriers
	if (req.query.hasOwnProperty("carrier") && req.query.carrier != "") {
	   var carrier = req.query.carrier;
	   shippingCosts.costs[carrier] = shippingRates[carrier][req.query.service];
	}
	else {
	   for (var carrier in shippingRates) {
		   shippingCosts.costs[carrier] = shippingRates[carrier][req.query.service];		
	   }
	}

	// Send stringified object in response with response code 200
	res.status(200).send(JSON.stringify(shippingCosts));
});

router.post("/parrot/:val", function(req, res, next) {

	// Initial object for response
	let responseObj = { };

	for (let key in req.params) {
	   responseObj["Route Parameter: " + key] = req.params[key];
	}

	for (let key in req.body) {
	   responseObj["Body property: " + key] = req.body[key];
	}

   console.log(responseObj);
   
	// Send stringified object in response with response code 200
	res.status(200).send(JSON.stringify(responseObj));
});

module.exports = router;
