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
  $("#uv").html(data.uvThreshold);
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#main").show();
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
      window.location = "index.html";
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


});
