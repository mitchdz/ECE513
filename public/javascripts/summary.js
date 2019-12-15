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


function populateActivitiesSummaryView(devices) {
  for (let device of devices) {
      $.ajax({
        url: '/devices/activities', 
        type: 'GET', 
        headers: { 'device': device.deviceId }, 
        dataType: 'json', 
      })
      .done(function(data, textStatus, jqXHR) {

      $("#addDeviceForm").before("<li class='collection-item'>ID: " +
        "<span class='ID'> " + device.deviceId + "</span>, APIKEY: <span class='ID'> " + device.apikey + "</span><br>" +
        " <button id='activitiesSummary-" + device.deviceId + "' class='waves-effect waves-light btn'>Activities Summary</button> " +
        " <li class='collection-item' id='activitiesSummaryDisplay-" + device.deviceId + "'>");
      console.log(data.activities);
      for(activity of data.activities) {

      }

      $("#addDeviceForm").before(
        " <button id='closeActivitiesSummary-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
        " </li>" +
        " </li>");
      $("#activitiesSummaryDisplay-"+device.deviceId).slideUp();
      $("#activitiesSummary-"+device.deviceId).click(function(event) {
        openActivitiesSummary(device.deviceId);
      });
      $("#closeActivitiesSummary-"+device.deviceId).click(function(event) {
        closeActivitiesSummary(device.deviceId);
      });


      })
      .fail(function(data, textStatus, jqXHR) {
        console.log(jqXHR);
      });
  }

}


function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#main").show();

  $("#totalDuration").html(0);
  $("#totalCalories").html(0);
  $("#totalUv").html(0);

  updateTotalView(data.devices);
  populateActivitiesSummaryView(data.devices);
}

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
