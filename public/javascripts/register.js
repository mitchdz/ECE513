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
  else {
    message = "Please enter the following key to register your account: " + getNewApikey();

    Email.send({
        SecureToken : "b543a1e3-2be0-4581-8def-9b6ebc3b2a50",
        To : 'mitch_dz@hotmail.com',
        From : "mitchdz@email.arizona.edu",
        Subject : "This is the subject",
        Body : "HEY YOUUUU"
    }).then(
      message => console.log(message)
    );


    // $.ajax({
    //   url: '/users/api/sendEmail',
    //   type: 'POST',
    //   contentType: 'application/json',
    //   data: JSON.stringify({email:email, 
    //       fullName:fullName, 
    //       email:email, 
    //       subject:"Register your Sunrunr Account",
    //       message:"yeet"}),
    //   dataType: 'json'
    //  })
    //     .done(registerSuccess)
    //     .fail(registerError);
  }

  // minimum 8 characters, can be any alphanumeric

  // var alphanumericTest = /^[a-zA-Z0-9_]{8,}$/;
  // if (alphanumericTest.test(password)) {
    // $.ajax({
    //   url: '/users/register',
    //   type: 'POST',
    //   contentType: 'application/json',
    //   data: JSON.stringify({email:email, fullName:fullName, password:password}),
    //   dataType: 'json'
    //  })
    //    .done(registerSuccess)
    //    .fail(registerError);
  // }
  // else {
  //   $('#ServerResponse').html("<span class='red-text text-darken-2'>Password needs to be alphanumeric and at least 8 characters.</span>");
  //   $('#ServerResponse').show();
  //   return;
  // }
}

function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {
    window.location = "index.html";
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
