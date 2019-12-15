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
	$('.map').each(function (index, Element) {
		devid = Element.innerHTML

		map = new google.maps.Map(Element, 
		{
			center: {lat:32.221667, lng:-110.926389},
			zoom: 12
		});

		maps[devid] = map;
	});
}

// function accountInfoSuccess(data, textSatus, jqXHR) {
//   $("#email").html(data.email);
//   $("#fullName").html(data.fullName);
//   $("#lastAccess").html(data.lastAccess);
//   $("#uvThreshold").html(data.uvThreshold);
//   $("#main").show();
  
//   // Add the devices to the list before the list item for the add device button (link)
//   for (let device of data.devices) {
//     $("#addDeviceForm").before("<li class='collection-item'>ID: " +
//       device.deviceId + ", APIKEY: " + device.apikey + "<br>" +
//       " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
//       " <button id='activity-" + device.deviceId + "' class='waves-effect waves-light btn'>Activity</button> " +

//       " <li class='collection-item' id='activityForm-" + device.deviceId + "'>" +
//       " <div id=map-" + device.deviceId + " class=map style=\"height: 30vh; max-width:40vw;\">" + device.deviceId + "</div>" +
//       " <p id=data-" + device.deviceId + "></p>" +
//       " <button id='refresh-" + device.deviceId + "' class='waves-effect waves-light btn'>Refresh</button> " +
//       " <button id='close-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
//       " </li>" +
//       " </li>");
//     //var map = new google.maps.Map(document.getElementById('#map-' + device.deviceId), {zoom: 7, center: {lat:32.221667, lng:-110.926389}});
//     $("#activityForm-"+device.deviceId).slideUp();
//     $("#activity-"+device.deviceId).click(function(event) {
//       activityDevice(event, device.deviceId);
//     });
//     $("#close-"+device.deviceId).click(function(event) {
//       closeActivity(event, device.deviceId);
//     });
//     $("#refresh-"+device.deviceId).click(function(event) {
//       refreshActivity(event, device.deviceId);
//     });
//   }

//   initMap();
// }


function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#main").show();

  $("#totalDuration").html(0);
  $("#totalCalories").html(0);
  $("#totalUv").html(0);

  updateTotalView(data.devices);

  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    // $("#addDeviceForm").before("<li class='collection-item'>ID: " +
    //   "<span class='ID'> " + device.deviceId + "</span>, APIKEY: <span class='ID'> " + device.apikey + "</span><br>" +


    //   " </li>");


    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + "<br>" +
      " <button id='summary-" + device.deviceId + "' class='waves-effect waves-light btn'>Summary</button> " +

      " <li class='collection-item' id='summaryForm-" + device.deviceId + "'>" +
      " <button id='closeSummary-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
      " </li>" +
      " </li>");
    //var map = new google.maps.Map(document.getElementById('#map-' + device.deviceId), {zoom: 7, center: {lat:32.221667, lng:-110.926389}});
    $("#summaryForm-"+device.deviceId).slideUp();
    $("#summary-"+device.deviceId).click(function(event) {
      showActivities(device.deviceId);
    });
    $("#closeSummary-"+device.deviceId).click(function(event) {
      closeActivity(event, device.deviceId);
    });
  }

  initMap();
}

function updateTotalView(devices) {
  for (device of devices) {
      $.ajax({
        url: '/devices/activities', 
        type: 'GET', 
        headers: { 'device': device.deviceId }, 
        dataType: 'json', 
      })
      .done(function(data, textStatus, jqXHR) {
        for (activity of data.activities) {

          let time = new Date();
          let currentTime = time.getTime();

          if ((currentTime - activity.timeAdded) < 604800000) {
            let calories = Number($("#totalCalories").html()) + activity.calories; 
            $("#totalCalories").html(calories); 
            let duration = Number($("#totalDuration").html()) + activity.duration; 
            $("#totalDuration").html(duration); 

            let tempSum = 0;
            for (tempUv of activity.uv) {
              tempSum += tempUv;
            }

            let uv = Number($("#totalUv").html()) + tempSum; 
            $("#totalUv").html(uv); 
          }
        }
      })
      .fail(function(data, textStatus, jqXHR) {
        console.log(jqXHR);
      });
  }
}

function showActivities(deviceId) {
  $.ajax({
    url: '/devices/allActivities', 
    type: 'GET', 
    headers: { 'deviceId': deviceId }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){
    for (var activity of data.activities) {
      if(typeof(activity.temp)!=="undefined"){ 
        var time = new Date(); 
        var timeNow = time.getTime(); 
        if((timeNow - activity.unix) < 604800000){
          var uvSum = 0; 
          for (var i = 0; i<activity.uv.length; i++){
            uvSum += activity.uv[i]; 
          }
          var duration = Number($("#duration").html()) + activity.duration; 
          $("#duration").html(duration);
          var calories = Number($("#calories").html()) + activity.calories; 
          $("#calories").html(calories); 
          var uv = Number($("#uvExposure").html()) + uvSum; 
          $("#uvExposure").html(uv); 
        }
      }
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    let response = JSON.parse(jqXHR.responseText);
    let error = $("<li class = 'collection-item'></li>");
    error.html(response.message); 
    $("#deviceErrorsList").append(error); 
    $("#deviceErrors").show(); 
  })  



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

			let newPosition = {lat: latitude, lng: longitude}
			let marker = new google.maps.Marker({position: newPosition, map: maps[deviceId]});

			marker.setTitle(datapoint.time + "\nUV index:" + datapoint.uv);
			marker.setLabel();
			marker.setClickable(true);
			marker.setDraggable(false);


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
        location.reload();
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
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
});
