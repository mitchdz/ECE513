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



function showActivities(device){
  $.ajax({
    url: '/devices/activities', 
    type: 'GET', 
    headers: { 'device': device.deviceId }, 
    dataType: 'json', 
  })
  .done(function(data, textStatus, jqXHR){
    for (var activity of data.activities) {
      if(typeof(activity.temp)!=="undefined") {
        var list = $("<ul class='collection with-header'></ul>"); 
        list.attr('id', "ul"+activity.date); 

        var header = $("<h5></h5>"); 
        header.html(activity.date); 

        var date = $("<li class='collection-header'></li>"); 
        date.append(header); 
        list.append(date);  
  
        var duration = $("<li class = 'collection-item'></li>"); 
        duration.html("Duration: "+activity.duration+' Minutes'); 
        list.append(duration); 

        var sum = 0; 
        for (var i = 0; i<activity.uv.length; i++){
          sum += activity.uv[i]; 
        }
        
        var uv = $("<li class = 'collection-item'></li>"); 
        uv.html("UV Exposure: "+sum); 
        list.append(uv); 

        var temp = $("<li class = 'collection-item'></li>"); 
        temp.html("Temperature: "+activity.temp+'\u00B0'+'F'); 
        list.append(temp); 

        var humidity = $("<li class = 'collection-item'></li>"); 
        humidity.html("Humidty: "+activity.humidity+"%"); 
        list.append(humidity); 

        var type = $("<li class = 'collection-item'></li>"); 
        type.html("Type of Workout: "+activity.type); 
        list.append(type); 

        var cals = $("<li class = 'collection-item'></li>"); 
        cals.html("Calories Burned: "+activity.calories); 
        list.append(cals); 

        var summary = $("<li class = 'collection-item'></li>"); 
        summary.attr('id', 'summary'+activity.date);

        var link = $("<a href = '#!' style = 'padding-right:10px;'></a>");
        link.click(function(){
          $(this).parent().parent().children().eq(8).slideDown();
          $(this).parent().parent().children().eq(7).hide();
        })
        link.attr('id', 'link '+activity.date); 
        link.html("Additional Information");

        var updateType = $("<a href = '#!'></a>"); 
        updateType.click(function(){
          $(this).parent().parent().children().eq(9).slideDown(); 
          $(this).parent().parent().children().eq(7).hide(); 
        });
        updateType.html("Change Workout Type"); 

        summary.append(link); 
        summary.append(updateType); 
        list.append(summary); 

        var summaryForm = $("<li class='collection-item'></li>"); 
        var speedDiv = $("<div style='margin-bottom:10px;height: 400px; width: 100%;'></div>");
        speedDiv.attr('id', 'speedContainer' + activity.date); 
        var uvDiv = $("<div style='margin-bottom:10px;height: 400px; wide:100%;'></div>");
        uvDiv.attr('id', 'uvContainer' + activity.date); 

        var button = $("<button class='waves-effect waves-light btn'></button>"); 
        button.html("Less Information"); 
        button.click(function(){
          $(this).parent().parent().children().eq(8).slideUp(); 
          $(this).parent().parent().children().eq(7).show(); 
        })
        summaryForm.append(speedDiv);
        summaryForm.append(uvDiv);  
        summaryForm.append(button);
        summaryForm.hide();  
      
        list.append(summaryForm); 
        
        var updateForm = $("<li class = 'collection-item'></li>");
        var typeButtonCancel = $("<button class='waves-effect waves-light btn'></button>"); 
        typeButtonCancel.html("Cancel"); 
        typeButtonCancel.click(function(){
          $(this).parent().parent().children().eq(9).slideUp(); 
          $(this).parent().parent().children().eq(7).show(); 
        })

        var walkButton = $("<button style='margin-right:10px;' class='waves-effect waves-light btn'></button>");
        walkButton.html("Walk"); 
        walkButton.attr("id", "walk"+activity.unix); 

        updateForm.append(walkButton);  
        walkButton.click(function(){
          var unix = String($(this).attr("id")).slice(4,); 
          $.ajax({
            url: '/devices/updateType', 
            type: 'POST', 
            headers: { 'x-auth': window.localStorage.getItem("authToken") },
            contentType: 'application/json', 
            data: JSON.stringify({unix:unix, type:'Walk'}), 
            dataType: 'json'
          })
          .done(function(data, textStatus, jqXHR){
            if(data.success){
              window.location.replace("activity.html"); 
            }
            else{
              let error = $("<li class = 'collection-item'></li>");
              error.html(data.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show(); 
            }
          })
          .fail(function(jqXHR, textStatus, errorThrown){
            if( jqXHR.status === 401 ) {
              window.localStorage.removeItem("authToken");
              window.location.replace("login_page.html");
            } 
            else {
              let response = JSON.parse(jqXHR.responseText);
              let error = $("<li class = 'collection-item'></li>");
              error.html(response.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show(); 
            }
          })
        }); 
      
        var runButton = $("<button style='margin-right:10px;' class='waves-effect waves-light btn'></button>");
        runButton.html("Run");
        runButton.attr("id", "run"+activity.unix);
        runButton.click(function(){
          var unix = String($(this).attr("id")).slice(3,); 
          $.ajax({
            url: '/devices/updateType', 
            type: 'POST', 
            headers: { 'x-auth': window.localStorage.getItem("authToken") },
            contentType: 'application/json', 
            data: JSON.stringify({unix:unix, type:'Run'}), 
            dataType: 'json'
          })
          .done(function(data, textStatus, jqXHR){
            if(data.success){
              window.location.replace("activity.html"); 
            }
            else{
              let error = $("<li class = 'collection-item'></li>");
              error.html(data.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show();      
            }
          })
          .fail(function(jqXHR, textStatus, errorThrown){
            if( jqXHR.status === 401 ) {
              window.localStorage.removeItem("authToken");
              window.location.replace("login_page.html");
            } 
            else {
              let response = JSON.parse(jqXHR.responseText);
              let error = $("<li class = 'collection-item'></li>");
              error.html(response.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show(); 
            } 
          })
        }); 

        var bikeButton = $("<button style='margin-right:10px;' class='waves-effect waves-light btn'></button>");
        bikeButton.html("Bike"); 
        bikeButton.attr("id", "bike"+activity.unix); 
        bikeButton.click(function(){
          var unix = String($(this).attr("id")).slice(4,); 
          $.ajax({
            url: '/devices/updateType', 
            type: 'POST', 
            headers: { 'x-auth': window.localStorage.getItem("authToken") },
            contentType: 'application/json', 
            data: JSON.stringify({unix:unix, type:'Bike'}), 
            dataType: 'json'
           })
          .done(function(data, textStatus, jqXHR){
            if(data.success){
              window.location.replace("activity.html"); 
            }
            else{
              let error = $("<li class = 'collection-item'></li>");
              error.html(data.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show(); 
            }
          })
          .fail(function(jqXHR, textStatus, errorThrown){
            if( jqXHR.status === 401 ) {
              window.localStorage.removeItem("authToken");
              window.location.replace("login_page.html");
            } 
            else {
              let response = JSON.parse(jqXHR.responseText);
              let error = $("<li class = 'collection-item'></li>");
              error.html(response.message); 
              $("#deviceErrorsList").append(error); 
              $("#deviceErrors").show(); 
            }
          })
        }); 

        updateForm.append(typeButtonCancel); 
        updateForm.append(walkButton); 
        updateForm.append(runButton); 
        updateForm.append(bikeButton); 
        updateForm.hide();
        list.append(updateForm);

        updateForm.append(typeButtonCancel); 
        $('#summaryDiv').append(list); 
        drawSpeedGraph(activity.speed, activity.date);
        drawUVGraph(activity.uv, activity.date);
      }
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    if( jqXHR.status === 401 ) {
      window.localStorage.removeItem("authToken");
      window.location.replace("login_page.html");
    } 
    else {
      let response = JSON.parse(jqXHR.responseText);
      let error = $("<li class = 'collection-item'></li>");
      error.html(response.message); 
      $("#deviceErrorsList").append(error); 
      $("#deviceErrors").show(); 
    }
  })  
}







function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#main").show();

  $("#totalDuration").html(0);
  $("#totalCalories").html(0);
  $("#totalUv").html(0);

  updateTotalView(data.devices);
  // populateActivitiesSummaryView(data.devices);
  for (device of data.devices) {
    showActivities(device);
  }
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
