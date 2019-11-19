let map = null;

function getRecentPotholes() {
  $.ajax({
    url: '/potholes/recent/14',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayMostRecentPothole)
    .fail(recentPotholeError);
}

function displayMostRecentPothole(data, textSatus, jqXHR) {
   $("#main").show();

   // If there's at least one pothole, draw the map
   let latitude = 32.2319;
	let longitude = -110.9501;
   let potholeReport = "No potholes have been reported in the last three days.";
   
	if (data.potholes.length > 0) {
	   let latitude = data.potholes[data.potholes.length-1].latitude;
	   let longitude = data.potholes[data.potholes.length-1].longitude;
		
      // Add descriptive text of the pothole recently reported 
      potholeReport = data.potholes.length +
	                  " potholes have been reported in the last three days. The most recent pothole (shown above) was hit " +
	                  data.potholes[data.potholes.length-1].totalHits + " times.";
   }
	    
   $("#potholeText").html(potholeReport);
   // Create a map centered at the most recent pothole location
   let uluru = {lat: latitude, lng: longitude};
   let map = new google.maps.Map(document.getElementById('map'), {
	   zoom: 10,
	   center: uluru
	});
	    
	// Add markers for all potholes            
   for (let pothole of data.potholes) {
      uluru = {lat: pothole.latitude, lng: pothole.longitude};
      let marker = new google.maps.Marker({
         position: uluru,
         map: map,
         label: {
            text: "" + pothole.totalHits,
            color: 'black',
            fontSize: "10px"
         },
      });
   }                 
}

function recentPotholeError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#potholeText").html("Error: " + status.message);
    $("#potholeText").show();
  } 
}

// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initRecent() {
    // Allow the user to refresh by clicking a button.
    $("#refreshRecent").click(getRecentPotholes);
    getRecentPotholes();
}

// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
});