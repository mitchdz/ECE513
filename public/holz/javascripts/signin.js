function sendSigninRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  
  $.ajax({
    url: '/users/signin',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email : email, password : password }), 
    dataType: 'json'
  })
    .done(signinSuccess)
    .fail(signinError);
}

function signinSuccess(data, textSatus, jqXHR) {
  // TODO
  window.localStorage.setItem('authToken', data.authToken);
  window.location = "account.html";
}

function signinError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

// Handle authentication on page load
$(function() {  
  // TODO 
  if( window.localStorage.getItem('authToken')) {
    window.location.replace('account.html');
  }
  else {
    $('#signin').click(sendSigninRequest);
     $('#password').keypress(function(event) {
        if( event.which === 13 ) {
           sendSigninRequest();
        }
     });
  }
});