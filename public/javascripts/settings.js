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



function updatePassword() {
  //TODO: validate password

  let password = $("#newPassword").val();
  console.log(password);

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
  });
}

function updateEmail() {

}

function updateName() {
  let inputFullName = $("#newName").val();
  console.log(inputFullName);

  $.ajax({
    type: "PUT",
    url: "/users/updateName",
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({"name": inputFullName}),
    contentType: "application/json"
  }).done(function(data) {
    console.log("updated name!");
    location.reload();
  }).fail(function(jqXHR) {
    $("#error").html("The user coudl not be updated.");
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


});
