function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('Name: ' + profile.getName());
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
   var id_token = googleUser.getAuthResponse().id_token;
   console.log(id_token);

   console.log("yeet");

   $.ajax({
    url: 'https://oauth2.googleapis.com/tokeninfo?id_token=' + id_token,
    type: 'GET',
    contentType: 'application/json',
    data: JSON.stringify({idtoken:id_token}),
    dataType: 'json'
   })
     .done(registerSuccess)
     .fail(registerError);


  //  $.ajax({
  //  url: '/users/registerToken',
  //  type: 'POST',
  //  contentType: 'application/json',
  //  data: JSON.stringify({idtoken:id_token}),
  //  dataType: 'json'
  // })
  //   .done(registerSuccess)
  //   .fail(registerError);
}

function registerSuccess(data, textStatus, jqXHR) {

  var email = data.email;
  var fullName = data.name;
  var password = data.sub;
  

  $.ajax({
    url: '/users/register',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({email:email, fullName:fullName, password:password}),
    dataType: 'json'
   })
   .done(function(data, textStatus, jqXHR) {
    window.location = "index.html";
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
    console.log(jqXHR);
  });
}

function registerError(jqXHR, textStatus, errorThrown) {
	console.log(errorThrown);
	console.log(jqXHR);
}
