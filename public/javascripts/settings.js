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

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#uv").html(data.uvThreshold);
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#main").show();

  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      "<span class='ID'> " + device.deviceId + "</span>, APIKEY: <span class='ID'> " + device.apikey + "</span><br>" +
      " <button id='replace-" + device.deviceId + "' class='waves-effect waves-light btn'>Replace</button> " +

      " <li class='collection-item' id='replaceForm-" + device.deviceId + "'>" +
      " <label for='newId-" + device.deviceId + "'>New Device ID (alphanumeric characters only):</label>" +
      " <input type='text' id='newId-" + device.deviceId + "' name='newId-" + device.deviceId + "' col='30'>" +
      " <button id='SubmitReplace-" + device.deviceId + "' class='waves-effect waves-light btn'>Submit</button> " +
      " <button id='closeReplace-" + device.deviceId + "' class='waves-effect waves-light btn'>Close</button> " +
      " </li>" +

      " </li>");
    $("#replaceForm-"+device.deviceId).slideUp();
    $("#replace-"+device.deviceId).click(function(event) {
      openReplace(event, device.deviceId);
    });
    $("#closeReplace-"+device.deviceId).click(function(event) {
      closeReplace(event, device.deviceId);
    });
    $("#SubmitReplace-"+device.deviceId).click(function(event) {
      SubmitReplace(event, device.deviceId);
    }); 
  }
}

function SubmitReplace(event, deviceId) {
  let newId = $('#newId-'+deviceId).val();
  let oldId = deviceId;

  let password = $("#newPassword").val();
  let passwordConfirm = $('#confirmPassword').val();

  $.ajax({
    type: "PUT",
    url: "/devices/replace",
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({"oldId": oldId, "newId": newId}),
    contentType: "application/json"
  }).done(function(data) {
    console.log("done");
    window.location.replace("settings.html");
  }).fail(function(jqXHR) {
    console.log(jqXHR);
    $("#error").html("The device could not be replaced.");
    $("#error").show();
  });

}


function closeReplace(event, deviceId) {
  console.log("close");
  $("#replaceForm-"+deviceId).slideUp();
}

function openReplace(event, deviceId) {
  console.log("open");
  $("#replaceForm-"+deviceId).slideDown();
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

// Show add device form and hide the add device button (really a link)
function showChangePasswordForm() {
  hideEmailForm();
  hideNameForm();
  $("#currentPassword").val("");        // Clear the input for the device ID
  $("#newPassword").val("");        // Clear the input for the device ID
  $("#confirmPassword").val("");        // Clear the input for the device ID    
  $("#changePasswordControl").hide();   // Hide the add device link
  $("#changePasswordForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideChangePasswordForm() {
  $("#changePasswordControl").show();  // Hide the add device link
  $("#changePasswordForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Show add device form and hide the add device button (really a link)
function showEmailForm() {
  hideChangePasswordForm();
  hideNameForm();
  $("#newEmail").val("");        // Clear the input for the device ID 
  $("#changeEmailControl").hide();   // Hide the add device link
  $("#changeEmailForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideEmailForm() {
  $("#changeEmailControl").show();  // Hide the add device link
  $("#changeEmailForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Show add device form and hide the add device button (really a link)
function showNameForm() {
  hideEmailForm();
  hideChangePasswordForm();
  $("#newName").val("");        // Clear the input for the device ID 
  $("#changeNameControl").hide();   // Hide the add device link
  $("#changeNameForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideNameForm() {
  $("#changeNameControl").show();  // Hide the add device link
  $("#changeNameForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Show add device form and hide the add device button (really a link)
function showUvForm() {
  $("#newUv").val("");        // Clear the input for the device ID 
  $("#changeUvControl").hide();   // Hide the add device link
  $("#changeUvForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideUvForm() {
  $("#changeUvControl").show();  // Hide the add device link
  $("#changeUvForm").slideUp();  // Show the add device form
  $("#error").hide();
}


function hideAllForms() {
    hideEmailForm();
    hideChangePasswordForm();
    hideNameForm();
    hideUvForm();
}

function updatePassword() {
  //TODO: validate password

  let password = $("#newPassword").val();
  let passwordConfirm = $('#confirmPassword').val();

  if (password == passwordConfirm) {
    $.ajax({
      type: "PUT",
      url: "/users/updatePassword",
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      data: JSON.stringify({"password": password}),
      contentType: "application/json"
    }).done(function(data) {
      window.localStorage.removeItem('authToken');
      window.location.replace("index.html");
    }).fail(function(jqXHR) {
      $("#error").html("The user could not be updated.");
      $("#error").show();
    });
  }
  else {
    $("#error").html("The passwords do not match.");
    $("#error").show();
  }
}





function updateUv() {
  let inputUvThreshold = $("#newUv").val();

  $.ajax({
    type: "PUT",
    url: "/users/updateUv",
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({"uvThreshold": inputUvThreshold}),
    contentType: "application/json"
  }).done(function(data) {
    location.reload();
  }).fail(function(jqXHR) {
    $("#error").html("The user could not be updated.");
  });
}



function updateEmail() {
  let inputEmail = $("#newEmail").val();

  $.ajax({
    url: "/users/updateEmail",
    type: "PUT",
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({"email": inputEmail}),
    contentType: "application/json"
  }).done(function(data) {
    window.localStorage.removeItem('authToken');
    window.location = "index.html";
    // location.reload();
  }).fail(function(jqXHR) {
    if (jqXHR.status == 400) {
      $("#error").html("That email already exists.");
      $('#error').show();
    }
    else {
      $("#error").html("The user email could not be updated.");
      $('#error').show();
    }
  });

}

function updateName() {
  let inputFullName = $("#newName").val();

  $.ajax({
    type: "PUT",
    url: "/users/updateName",
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({"name": inputFullName}),
    contentType: "application/json"
  }).done(function(data) {
    location.reload();
  }).fail(function(jqXHR) {
    $("#error").html("The user could not be updated.");
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
  
  // Register event listeners for password
  $("#changePassword").click(showChangePasswordForm);
  $("#updatePassword").click(updatePassword);  
  $("#passwordCancel").click(hideChangePasswordForm);  

  $("#changeEmail").click(showEmailForm);
  $("#updateEmail").click(updateEmail);  
  $("#emailCancel").click(hideEmailForm);  

  $("#changeName").click(showNameForm);
  $("#updateName").click(updateName);  
  $("#nameCancel").click(hideNameForm);  

  $("#changeUv").click(showUvForm);
  $("#updateUv").click(updateUv);  
  $("#UvCancel").click(hideUvForm);  

  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
});
