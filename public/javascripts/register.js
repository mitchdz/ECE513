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

  // minimum 8 characters, can be any alphanumeric

  var alphanumericTest = /^[a-zA-Z0-9_]{8,}$/;
  if (alphanumericTest.test(password)) {
    $.ajax({
      url: '/users/register',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({email:email, fullName:fullName, password:password}),
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
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});
