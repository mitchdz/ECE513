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

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#main").show();

  // populate the 5 day weather forecast
  for (var i = 1; i < 6; i++) {
    $("#endingDiv").before(
      "<ul id = 'day" + i + "' class='collection with-header'>" +
      "  <li class='collection-header'>" +
      "    <h5><span id = 'head" + i + "'></span></h5>" +
      "  </li>" +
      "  <li class='collection-item'>Temperature: <span id='t" + i + "'></span></li>" +
      "  <li class='collection-item'>Humidity: <span id='h" + i + "'></span></li>" +
      "  <li class = 'collection-item'>UV Index: <span id = 'u" + i + "'></span></li>" +
      "</ul>"
      );
  }
  hideForecast();
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

function hideForecast() {
  for (var i = 1; i < 5 + 1; i++)
    $("#day"+i).hide();
}

function showForecast() {
  for (var i = 1; i < 5 + 1; i++)
    $("#day"+i).show();
}

function refreshForecast() {
  let lat = $("#userLatitude").val();
  let lon = $("#userLongitude").val();
  $("#latitude").html(lat);
  $("#longitude").html(lon);
  getWeatherInfo();

}


function getWeatherInfo() {
  var lat = $("#userLatitude").val(); 
  var lon = $("#userLongitude").val(); 
  var valid = true; 
  if(lat>90 || lat<-90 || isNaN(lat)){
    // $("#error").html("Error: " + status.message);
    // $("#error").show();


    $("#error").html("latitude value needs to be between -90 and 90 degrees.");
    $("#error").show(); 
    return;
  }
  if(lon>180 || lon<-180 || isNaN(lon)){
    $("#error").html("longitude value needs to be between -180 and 180 degrees.");
    $("#error").show(); 
    return;
  }

  $.ajax({
    url: 'https://api.openweathermap.org/data/2.5/forecast?appid=6e5be09cc06697c608c9d8a12dda7698&lat='+lat+'&lon='+lon,
    type: 'GET',
    dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){ 
    var humidity = [];
    var temp = []; 
    var header = [];  
    var count = 0;
    var weatherInfo = data.list;  

    if(lat > 0){
      $("#latitude").html(lat+'\u00B0'+" North"); 
    }
    else{
      var latString = String(lat); 
      var latString2 = latString.slice(1,); 
      $("#latitude").html(latString2+'\u00B0'+" South"); 
    }

    if(lon > 0){
      $("#longitude").html(lon+'\u00B0' + " East"); 
    }
    else{
      var lonString = String(lon); 
      var lonString2 = lonString.slice(1,); 
      $("#longitude").html(lonString2+'\u00B0'+" West"); 
    }

    for(var i = 0; i<weatherInfo.length; i++){
      if (i%8 == 4){
        humidity.push(weatherInfo[i]["main"].humidity); 
        var tk = Number(weatherInfo[i]["main"].temp);
        var tf = ((tk-273.15)*9/5+32).toFixed(2); 
        temp.push(tf);
        var date = weatherInfo[i]["dt_txt"]; 
        header.push(date.slice(0,10)); 
      }
      count++
    }


    for (var i = 0; i < 5; i++) {
      $("#t"+(i+1)).html(temp[i] + '\u00B0'+"F"); 
      $("#h"+(i+1)).html(humidity[i] + "%"); 
      $("#head"+(i+1)).html(header[i]); 
    }
    getUVInfo();
    showForecast();
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    let response = JSON.parse(jqXHR.responseText);
    var error = $("<li class = 'collection-item'></li>");
    error.html(response);
    $("#updateErrorsList").append(error); 
    $("#errors").show();  
  })
}


function getUVInfo() {
  var lat = $("#userLatitude").val(); 
  var lon = $("#userLongitude").val(); 
  $.ajax({
    url: 'https://api.openweathermap.org/data/2.5/uvi/forecast?appid=6e5be09cc06697c608c9d8a12dda7698&lat='+lat+'&lon='+lon,
    dataType: 'json'
  })
  .done(function(data, textSatus, jqXHR){ 
    var uv = []; 
    for(var uvIndex of data){
      uv.push(uvIndex.value); 
    }
    for (var i = 0; i < 5; i++) {
      $("#u"+(i+1)).html(uv[i]);
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    let response = JSON.parse(jqXHR.responseText);
    var error = $("<li class = 'collection-item'></li>");
    error.html(response);
    $("#updateErrorsList").append(error); 
    $("#errors").show();  
  })
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
    
  $("#updateLocation").click(refreshForecast);  
});
