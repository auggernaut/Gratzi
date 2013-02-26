
function github() {
  return new Github({
    token: $.cookie('git-oauth-token'),
    username: $.cookie('username'),
    auth: "oauth"
  });
}


git = {

  getAuthUrl: function (clientId) {
    return "https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=repo,user,gist";
  },

  authenticate: function (code, callback) {

    $.getJSON('http://mighty-refuge-1633.herokuapp.com/authenticate/' + code, function (data) {

      if (data.token) {
        $.cookie('git-oauth-token', data.token);
        callback();
      }
      else
        callback(data);
      // Adjust URL
      //var regex = new RegExp("\\?code="+match[1]);
      //window.location.href = window.location.href.replace(regex, '').replace('&state=', '');

    });

  },

  load: function (cb) {

    if ($.cookie('git-oauth-token')) {
      $.ajax({
        type: "GET",
        url: 'https://api.github.com/user',
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        headers: { Authorization: 'token ' + $.cookie('oauth-token') },
        success: function (res) {
          $.cookie("avatar", res.avatar_url);
          $.cookie("username", res.login);

          var user = github().getUser();
          var owners = {};

          user.repos(function (err, repos) {

            var found = false;

            _.each(repos, function (r) {
              if (r.name == "Gratzi-Store")
                found = true;
            });

            if (!found) {
              var gratziRepo = {
                "name": "Gratzi-Store",
                "description": "Gratzi Store.",
                "homepage": "https://github.com/" + res.login + "/gratzi-store",
                "private": false,
                "has_issues": true,
                "has_wiki": true,
                "has_downloads": true,
                "auto_init": true
              }

              github().createRepository(gratziRepo, function (err, res) {
                cb(null, res);
              });
            }
            else
              cb(null, repos);
          });
        },
        error: function (err) {
          cb('error', { "available_repos": [], "owners": {} });
        }
      });

    } else {
      cb(null, "not logged in");
    }
  },

  addGratzi: function (newGratzi, cb) {
    var repo = github().getRepo($.cookie("username"), "Gratzi-Store");

    repo.write("master", newGratzi.thanker + "-" + newGratzi.thankee, JSON.stringify(newGratzi), newGratzi.message + "-" + newGratzi.tags, function(err, res){
      cb(err, res);
    });

  },


  logout: function () {
    console.log("Logging out.");
    $.cookie("username", null);
    $.cookie("git-oauth-token", null);
    $.cookie("avatar", null);
    window.location.href = "/#";
  },


}