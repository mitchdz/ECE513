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

function updateSummarynewCollection(data) {
  // Add the devices to the newCollection before the newCollection item for the add device button (link)
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

function createSevenDayGraph(chartName, chartTitle, yLabel, xLabel, labels, values) {
var chart = new CanvasJS.Chart(chartName, {
  animationEnabled: true,
  theme: "light2", // "light1", "light2", "dark1", "dark2"
  title:{
    text: chartTitle
  },
  axisY: {
    title: yLabel
  },
  axisX: {
    title: xLabel
  },
  data: [{        
    type: "column",  
    legendMarkerColor: "grey",
    dataPoints: [      
      { y: values[0], label: labels[0] },
      { y: values[1],  label: labels[1] },
      { y: values[2],  label: labels[2] }
    ]
  }]
});
chart.render();

}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  let radiusEarth = 6371; //km
  let dLat = toRad(lat2-lat1);
  let dLon = toRad(lon2-lon1); 
  let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let distance = radiusEarth * c; //Distance in km
  return distance;
}

function toRad(deg) {
  return deg * (Math.PI/180)
}


var durationList = [0, 0, 0];
var caloriesList = [0, 0, 0];
var uvList = [0, 0, 0];

function updateTotalsView(userDevices) {
  var listOfPersonalActivities = [];
  $.ajax({
    url: '/devices/allActivities', 
    type: 'GET', 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR) {
    listOfPersonalActivities = [];
    for (activity of data.activities) {
      let isPersonal = false;
      let isLocal = false;

      for (device of userDevices) {
        if (device.deviceId == activity.deviceId) {
          listOfPersonalActivities.push({lat:activity.gps_lat[0], lon:activity.gps_long[0]});
          isPersonal = true;
        }
      }

      var minimumDistance = 99999999; // arbitrarily large number
      for (personalActivity of listOfPersonalActivities) {
        console.log(personalActivity);
        var distanceBetweenKm = getDistanceFromLatLonInKm(personalActivity.lat, personalActivity.lon, activity.gps_lat[0], activity.gps_long[0]);
        console.log("distance: " + distanceBetweenKm);
        console.log(distanceBetweenKm);
        if (distanceBetweenKm < minimumDistance) {
          minimumDistance = distanceBetweenKm;
        }
      }

      console.log("minimum: " + minimumDistance);
      if (minimumDistance < 100) {
        isLocal = true;
      }

      let time = new Date();
      let currentTime = time.getTime();
      if ((currentTime - activity.timeAdded) < 604800000) {

        let tempUvSum = 0;
        for (tempUv of activity.uv) {
          tempUvSum += tempUv;
        }

        let i = 0;
        if (isPersonal) {
          durationList[i] = durationList[i] + activity.duration;
          caloriesList[i] = caloriesList[i] + activity.calories;
          uvList[i] = uvList[i] + tempUvSum;
        }

        i = 1;
        if (isLocal) {
          durationList[i] = durationList[i] + activity.duration;
          caloriesList[i] = caloriesList[i] + activity.calories;
          uvList[i] = uvList[i] + tempUvSum;
        }

        i = 2;
        durationList[i] = durationList[i] + activity.duration;
        caloriesList[i] = caloriesList[i] + activity.calories;
        uvList[i] = uvList[i] + tempUvSum;
      }
    }
    console.log(listOfPersonalActivities);

    createSevenDayGraph(sevenDayContainerDuration, 
                        "Seven Day Total Duration", 
                        "minutes", 
                        "user category",
                        ["personal", "local users", "all users"],
                        durationList);


    createSevenDayGraph(sevenDayContainerCalories, 
                        "Seven Day Total Calories Burned", 
                        "calories", 
                        "user category",
                        ["personal", "local users", "all users"],
                        caloriesList);


    createSevenDayGraph(sevenDayContainerUv, 
                        "Seven Day Total UV exposure", 
                        "uv exposure", 
                        "user category",
                        ["personal", "local users", "all users"],
                        uvList);
  })
  .fail(function(data, textStatus, jqXHR) {
    console.log(jqXHR);
  });
}


function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#uvThreshold").html(data.uvThreshold);
  $("#main").show();


  $("#totalDuration").html(0);
  $("#totalCalories").html(0);
  $("#totalUv").html(0);

  updateTotalsView(data.devices);

  for (let device of data.devices) {
    showActivities(device);
  }

  initMap();
}

function createGPSSpeedGraph(speedData, date){
  let data = []; 
  let time = 0; 
  for (let i = 0; i<speedData.length; i++){
    let set = {x:time, y:speedData[i]};
    data.push(set); 
    time+=15; 
  }

  let chart = new CanvasJS.Chart(("speedContainer"+date), {
    animationEnabled: true,
    theme: "light3",
    title:{
      text: "Speed During Workout",
      includeZero: false
    },
    axisX:{
      title: "Time (seconds)",
      includeZero: false,
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY:{
      title: "Speed (mph)",
      includeZero: true,
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      },
      includeZero: false
    },
    data: [{        
      type: "line",       
      dataPoints: data
    }]
  });
  chart.render();
}


function createUVGraph(uvData,date){
  let data = []; 
  let time = 0; 
  let sum = 0; 
  for (let i = 0; i<uvData.length; i++){
    sum+=uvData[i]; 
    var set = {x:time, y:sum};
    data.push(set); 
    time+=15; 
  }

  let chart = new CanvasJS.Chart("uvContainer"+date, {
    animationEnabled: true,
    theme: "light3",
    title:{
      text: "UV Exposure During Workout"
    },
    axisX:{
      title: "Time (seconds)",
      includeZero: false,
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      },
      includeZero:false
    },
    axisY:{
      title: "UV Exposure",
      includeZero: true,
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      },
      includeZero: false
    },
    data: [{        
      type: "line",       
      dataPoints: data
    }]
  });
  chart.render();
}


function addActivityToSummary(activity) {
  var newCollection = $("<ul class='collection with-header' id='ul" + activity.timeAdded + "'></ul>"); 

  let sum = 0; 
  for (let i = 0; i<activity.uv.length; i++){
    sum += activity.uv[i]; 
  }
  newCollection.append("<li class='collection-header'><h5>" + activity.timeStarted + "</h5></li>");  
  newCollection.append("<li class = 'collection-item'>Device ID: " + activity.deviceId + "</li>");
  newCollection.append("<li class = 'collection-item'>Workout Type: " + activity.type + "</li>"); 
  newCollection.append("<li class = 'collection-item'>Duration: " + activity.duration + " Minutes</li>"); 
  newCollection.append("<li class = 'collection-item'>Calories Burned: " + activity.calories + "</li>"); 
  newCollection.append("<li class = 'collection-item'>UV Exposure: " +sum + "</li>"); 
  newCollection.append("<li class = 'collection-item'>Temperature: " + activity.temperature + "\u00B0F</li>"); 
  newCollection.append("<li class = 'collection-item'>Humidity: " + activity.humidity + "</li>"); 

  let summary = $("<li class = 'collection-item' id='summary" + activity.timeAdded + "'></li>"); 
  let link = $("<a href = '#!' style = 'padding-right:20px;' id='link' + " + activity.timeAdded + "'>Activity Detail View</a>");
  link.click(function(){
    $(this).parent().parent().children().eq(9).slideDown();
    $(this).parent().parent().children().eq(7).hide();
  })

  let updateType = $("<a href = '#!'>Change Workout Type</a>"); 
  updateType.click(function(){
    $(this).parent().parent().children().eq(10).slideDown(); 
    $(this).parent().parent().children().eq(7).hide(); 
  });

  summary.append(link); 
  summary.append(updateType); 
  newCollection.append(summary); 

  var summaryForm = $("<li class='collection-item'></li>"); 
  var speedDiv = $("<div style='margin-bottom:10px;height: 400px; width: 100%;'></div>");
  speedDiv.attr('id', 'speedContainer' + activity.timeAdded);
  var uvDiv = $("<div style='margin-bottom:10px;height: 400px; wide:100%;'></div>");
  uvDiv.attr('id', 'uvContainer' + activity.timeAdded); 

  var button = $("<button class='waves-effect waves-light btn'>Collapse</button>"); 
  button.click(function(){
    $(this).parent().parent().children().eq(9).slideUp(); 
    $(this).parent().parent().children().eq(7).show(); 
  })
  summaryForm.append(speedDiv);
  summaryForm.append(uvDiv);  
  summaryForm.append(button);
  summaryForm.hide();  

  newCollection.append(summaryForm); 

  var updateForm = $("<li class = 'collection-item'></li>");
  var typeButtonCancel = $("<button class='waves-effect waves-light btn'>Cancel</button>"); 
  typeButtonCancel.click(function(){
    $(this).parent().parent().children().eq(10).slideUp(); 
    $(this).parent().parent().children().eq(7).show(); 
  })

  let walkButton = $("<button style='margin-right:15px;' class='waves-effect waves-light btn' id='walk" + activity.timeAdded + "'>Walk</button>");
  // document.getElementById("walk" + activity.timeAdded).addEventListener("click", updateType(activity, "walk"));
  walkButton.click(function() {
    updateType(activity, "walk");
  }); 

  let runButton = $("<button style='margin-right:15px;' class='waves-effect waves-light btn' id='run" + activity.timeAdded + "'>Run</button>");
  runButton.click(function() {
    updateType(activity, "run");
  }); 

  let bikeButton = $("<button style='margin-right:15px;' class='waves-effect waves-light btn' id='bike" + activity.timeAdded + "'>Bike</button>");
  bikeButton.click(function() {
    updateType(activity, "bike");
  }); 

  updateForm.append(typeButtonCancel); 
  updateForm.append(walkButton); 
  updateForm.append(runButton); 
  updateForm.append(bikeButton); 
  updateForm.hide();
  newCollection.append(updateForm);

  updateForm.append(typeButtonCancel); 
  $('#summaryDiv').append(newCollection); 
  createGPSSpeedGraph(activity.gps_speed, activity.timeAdded);
  createUVGraph(activity.uv, activity.timeAdded);
}


function populateActivities(data) {
  for (let activity of data.activities) {
    if (activity.temperature) { // sometimes temperature is not stored properly
      addActivityToSummary(activity);
    }
  }
}

function updateType(activity, updatedType) {
  var unix = String($(this).attr("id")).slice(4,); 
  $.ajax({
    url: '/devices/updateType', 
    type: 'POST', 
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json', 
    data: JSON.stringify({timeAdded:activity.timeAdded, newType:updatedType}), 
    dataType: 'json'
  })
  .done(function(data, textStatus, jqXHR){
    if(data.success){
      window.location.replace("activity.html"); 
    }
    else{
      $("error").html(jqXHR.textStatus);
      $("error").show();
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    if( jqXHR.status === 401 ) {
      window.localStorage.removeItem("authToken");
      window.location.replace("login_page.html");
    } 
    else {
      $("error").html(jqXHR.textStatus);
      $("error").show();
    }
  })
}

function showActivities(device){
  $.ajax({
    url: '/devices/activities', 
    type: 'GET', 
    headers: { 'device': device.deviceId }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){
    populateActivities(data);
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    if( jqXHR.status === 401 ) {
      window.localStorage.removeItem("authToken");
      window.location.replace("login_page.html");
    } 
    else {
      $("#error").html(jqXHR.responseText);
      $("#error").show();
    }
  })  
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

          // console.log(activity.timeStarted);
          // let tempDate = activity.timeStarted.split(" ")[0];
          // let tempTime = activity.timeStarted.split(" ")[1];

          // let tempMonth = tempDate.split("/")[0];
          // let tempDay = tempDate.split("/")[1];
          // let tempYear = tempDate.split("/")[2];

          // let tempHours = tempTime.split(":")[0];
          // let tempMinutes = tempTime.split(":")[1];
          // let tempSeconds = tempTime.split(":")[2];

          // var tempStartTime = new Date(tempYear - 1, tempMonth, tempDay, tempHours, tempMinutes, tempSeconds);
          // console.log("constructed time: " + tempStartTime);

          // console.log(currentTime - tempStartTime.getTime() / 1000);

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
