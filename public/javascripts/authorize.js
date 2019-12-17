function sendRegisterRequest() {
  let email = $('#email').val();
  let authorizationKey = $('#APIKEY').val();


  $.ajax({
    url: '/users/authorizeStagingUser',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({email:email, 
        APIKEY: authorizationKey,
        }),
    dataType: 'json'
   })
      .done(registerSuccess)
      .fail(registerError);


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
