function sendRegisterRequest() {
  let email = $('#email');
  let passowrd = $'#password').val();
  let fullName = $('#fullName').val();
  let passwordConfirm = $('#passwordConfirm').val();
  
  if (password != passwordConfirm) {
    $('#ServerResponse').html('<p>Password does not match.</p>');
    $('#ServerResponse').show();
    return;
  }
  
  $.ajax({
    url:	'/users/register'.
    type:	'POST',
    contentType:	'application/json',
    data:		JSON.stringify({email:email, fullName:fullName, password:password}),
    dataType:	'JSON'
  })
    .done(registerSuccess)
    .fail(registerError)
}

function registerSuccess(data, textSatus, jqXHR) {
  if (data.success) {
    window.location = "index.html";
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('ServerResponse').html('<p>Server could not be reached.</p>');
    $('ServerResponse').show();
  }
  else {
    $('ServerResponse').html('<[>Error: ' + jqXHR.responseJSON.message + '</p>');
    $('ServerResponse').show();
  }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});

