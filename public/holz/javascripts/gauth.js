function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('Name: ' + profile.getName());
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
   var id_token = googleUser.getAuthResponse().id_token;
   console.log(id_token);

   $.ajax({
	   url: '/users/register',
	   type: 'POST',
	   contentType: 'application/json',
	   data: JSON.stringify({idtoken: id_token}),
	   dataType: 'json'
   })
     .done(registerSuccess)
     .fail(registerError);
}

function registerSuccess(data, textStatus, jqXHR) {
	window.localStorage.setItem('authToken', data.authToken);
	window.location="index.html";
}

function registerError(jqXHR, textStatus, errorThrown) {
	console.log(jqXHR);
}