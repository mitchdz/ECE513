var maps = {}

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

function updateSummaryList(data) {
  // Add the devices to the list before the list item for the add device button (link)
  for (device of data.devices) {
      $.ajax({
        url: '/devices/activities', 
        type: 'GET', 
        headers: { 'device': device.deviceId }, 
        dataType: 'json', 
      })
      .done(function(data, textStatus, jqXHR) {
        for (activity of data.activities) {
          $("#addDeviceForm").before("<li class='collection-item'>ID: " +
            device.deviceId + ", APIKEY: " + device.apikey + "<br>" +
            " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
            " <button id='activity-" + device.deviceId + "' class='waves-effect waves-light btn'>Activity</button> " +

            " <li class='collection-item' id='activityForm-" + device.deviceId + "'>" +
            " <div id=map-" + device.deviceId + " class=map style=\"height: 30vh; max-width:40vw;\">" + device.deviceId + "</div>" +
            " <p id=data-" + device.deviceId + "></p>" +
            " <button id='refresh-" + device.deviceId + "' class='waves-effect waves-light btn'>Refresh</button> " +
            " <button id='close-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
            " </li>" +
            " </li>");
          //var map = new google.maps.Map(document.getElementById('#map-' + device.deviceId), {zoom: 7, center: {lat:32.221667, lng:-110.926389}});
          $("#activityForm-"+device.deviceId).slideUp();
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
      })
      .fail(function(data, textStatus, jqXHR) {
        console.log(jqXHR);
      });
  }
}


function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#uvThreshold").html(data.uvThreshold);
  $("#main").show();

  updateSummaryList(data);

  initMap();
}


// function accountInfoSuccess(data, textSatus, jqXHR) {
//   $("#email").html(data.email);
//   $("#fullName").html(data.fullName);
//   $("#main").show();

//   $("#totalDuration").html(0);
//   $("#totalCalories").html(0);
//   $("#totalUv").html(0);

//   updateTotalView(data.devices);
//   // populateActivitiesSummaryView(data.devices);
//   for (device of data.devices) {
//     showActivities(device);
//   }
// }

function openActivitiesSummary(deviceId) {
  $("#activitiesSummaryDisplay-"+device.deviceId).slideDown();
}

function closeActivitiesSummary(deviceId) {
  $("#activitiesSummaryDisplay-"+device.deviceId).slideUp();
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
});
