var maps = []

function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function initMap()
{
	document.querySelectorAll('.map').forEach(function(mapElement) {
		maps.push(new google.maps.Map(document.getElementById(mapElement), 
		{
			center: {lat:32.221667, lng:-110.926389},
			zoom: 8
		}));
	});
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#main").show();
  
  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + 
      " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
      " <button id='activity-" + device.deviceId + "' class='waves-effect waves-light btn'>Activity</button> " +
      " <button id='replace-" + device.deviceId + "' class='waves-effect waves-light btn'>Replace</button> " +
      " <li class='collection-item' id='activityForm-" + device.deviceId + "'>" +
      " <div id=map-" + device.deviceId + " class=map style=\"height: 200px; width=300px\"></div>" +
      " <p id=data-" + device.deviceId + "></p>" +
      " <button id='refresh-" + device.deviceId + "' class='waves-effect waves-light btn'>Refresh</button> " +
      " <button id='close-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
      " </li>" +
      " </li>");
    //var map = new google.maps.Map(document.getElementById('#map-' + device.deviceId), {zoom: 7, center: {lat:32.221667, lng:-110.926389}});
    $("#activityForm-"+device.deviceId).slideUp();
    $("#ping-"+device.deviceId).click(function(event) {
      pingDevice(event, device.deviceId);
    });
    $("#replace-"+device.deviceId).click(function(event) {
      replaceDevice(event, device.deviceId);
    });    
    $("#activity-"+device.deviceId).click(function(event) {
      activityDevice(event, device.deviceId);
    });
    $("#close-"+device.deviceId).click(function(event) {
      closeActivity(event, device.deviceId);
    });
    $("#refresh-"+device.deviceId).click(function(event) {
      refreshActivity(event, device.deviceId);
    });
  }
}

function refreshActivity(event, deviceId) {
  $.ajax({
    url: '/devices/getData',
    type: 'GET',
    headers: " 'x-auth'=" +  window.localStorage.getItem("authToken"),  
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
      //  console.log(data);
       for(let datapoint of data.data) {
        // console.log(datapoint);

        let devicesList = { data: [] };
        if (datapoint.deviceId == deviceId) {
          let latitude = datapoint.gps_lat;
          let longitude = datapoint.gps_long;

          $('#data-'+deviceId).text("longitude: " + longitude +
                                    " latitude: " + latitude +
                                    " gps_speed: " + datapoint.gps_speed +
                                    " uv: " + datapoint.uv);
        }
       }

     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 

}

function activityDevice(event, deviceId) {
  $("#activityForm-"+deviceId).slideDown();
}

function closeActivity(event, deviceId) {
  $("#activityForm-"+deviceId).slideUp();
}


function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

// Registers the specified device with the server.
function registerDevice() {
  var alphanumericTest = /^[a-zA-Z0-9_]*$/;
  if (alphanumericTest.test($('#deviceId').val())) {
    $.ajax({
      url: '/devices/register',
      type: 'POST',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },  
      contentType: 'application/json',
      data: JSON.stringify({ deviceId: $("#deviceId").val(), email:$("#email").text() }), 
      dataType: 'json'
     })
       .done(function (data, textStatus, jqXHR) {
         // Add new device to the device list
         $("#addDeviceForm").before("<li class='collection-item'>ID: " +
         $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
           " <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Ping</button> " +
           " <button id='activity-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Activity</button> " +
           " <button id='replace-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Replace</button> " +
           "</li>");
         $("#ping-"+$("#deviceId").val()).click(function(event) {
           pingDevice(event, device.deviceId);
         });
         $("#replace-"+$("#deviceId").val()).click(function(event) {
          replaceDevice(event, device.deviceId);
         });    
         $("#activity-"+$("#deviceId").val()).click(function(event) {
          activityDevice(event, device.deviceId);
         });             
         hideAddDeviceForm();
       })
       .fail(function(jqXHR, textStatus, errorThrown) {
         let response = JSON.parse(jqXHR.responseText);
         $("#error").html("Error: " + response.message);
         $("#error").show();
       }); 
  }
  else {
         $("#error").html("Error: only alphanumeric characters allowed");
         $("#error").show();    
  }

}




function replaceDevice(event, deviceId) {
  console.log("IMPLEMENT REPLACE");

}

function pingDevice(event, deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForAccountInfo();
  }
  
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
});
