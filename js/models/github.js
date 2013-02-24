 // Gimme a Github object! Please.
function github() {
   return new Github({
     token: $.cookie('oauth-token'),
     username: $.cookie('username'),
     auth: "oauth"
   });
 }


window.git = {

    getAuthUrl: function(clientId) {
      return "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=repo,user,gist";
    },

    authenticate: function(code, callback) {

      $.getJSON('http://localhost:9999/authenticate/'+code, function(data) {
         $.cookie('oauth-token', data.token);
          window.authenticated = true;
          // Adjust URL
          //var regex = new RegExp("\\?code="+match[1]);
          //window.location.href = window.location.href.replace(regex, '').replace('&state=', '');
          callback();
      });
          
    },

   load: function (cb) {

     if (window.authenticated) {
       $.ajax({
         type: "GET",
         url: 'https://api.github.com/user',
         dataType: 'json',
         contentType: 'application/x-www-form-urlencoded',
         headers : { Authorization : 'token ' + $.cookie('oauth-token') },
         success: function(res) {
           $.cookie("avatar", res.avatar_url);
           $.cookie("username", res.login);
           
           var user = github().getUser();
           var owners = {};

           user.repos(function(err, repos) {
             user.orgs(function(err, orgs) {
               _.each(repos, function(r) {
                 owners[r.owner.login] = owners[r.owner.login] ? owners[r.owner.login].concat([r]) : [r];
               });
               
               cb(null, {
                 "available_repos": repos,
                 "organizations": orgs,
                 "owners": owners
               });
             });
           });

         },
         error: function(err) { 
           cb('error', { "available_repos": [], "owners": {} });
         }
       });

     } else {
       cb(null, { "available_repos": [], "owners": {} });
     }
   },


   logout: function(){
      console.log("Logging out.");
      window.authenticated = false;
      $.cookie("username", null);
      $.cookie("oauth-token", null);
   },


}