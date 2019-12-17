// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

function sendRegisterRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  let fullName = $('#fullName').val();
  let passwordConfirm = $('#passwordConfirm').val();

  // Check to make sure the passwords match
  // FIXME: Check to ensure strong password 
  if (password != passwordConfirm) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Passwords do not match.</span>");
    $('#ServerResponse').show();
    return;
  }
<<<<<<< HEAD
  else {
    //check password strength
    var alphanumericTest = /^[a-zA-Z0-9_]{8,}$/;
    if (alphanumericTest.test(password)) {
      message = "Please enter the following key to register your account: \n\n" + getNewApikey();
      message += "\n\nYou have 24 hours to activate your account.";

      Email.send({
          SecureToken : "b543a1e3-2be0-4581-8def-9b6ebc3b2a50",
          To : email,
          From : "mitchdz@email.arizona.edu",
          Subject : "Register your Sunrunr Account",
          Body : message
      }).then(
        message => console.log(message)
      );

      // add user account to staging

      
=======
  else { 

    var alphanumericTest = /^[a-zA-Z0-9_]{8,}$/;
    if (alphanumericTest.test(password)) {
      authorizationKey = getNewApikey();
      message = "Please enter the following key to register your account: " + authorizationKey;

      Email.send({
          SecureToken : "b543a1e3-2be0-4581-8def-9b6ebc3b2a50",
          // Host : "smtp.elasticemail.com",
          // Username : "mitchdz@email.arizona.edu",
          // Password : "PASS",
          To : email,
          From : "mitchdz@email.arizona.edu",
          Subject : "Register your Sunrunr Account",
          Body : message
      }).then(
        message => console.log(message)
      );


      $.ajax({
        url: '/users/addStagingUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email:email, 
            fullName:fullName, 
            APIKEY: authorizationKey,
            password: password
            }),
        dataType: 'json'
       })
          .done(registerSuccess)
          .fail(registerError);
    } 
    else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Password needs to be alphanumeric and at least 8 characters.</span>");
    $('#ServerResponse').show();
    return;
    }
  }
>>>>>>> 71f8e858349adc57c3d31c1d3bc74c32df360317





    }

  }
}

function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {
    $('#ServerResponse').html("<span> Please check your email.</span>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
    $('#ServerResponse').show();
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  console.log(jqXHR.responseText);
  // if (jqXHR.statusCode == 404) {
  //   $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
  //   $('#ServerResponse').show();
  // }
  // else {
  //   $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
  //   $('#ServerResponse').show();
  // }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});
