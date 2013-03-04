gratzi.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "send": "send",
    "about": "about",
    "view": "view",
    "auth": "auth",
    "signin": "auth"
  },

  initialize: function () {

    var self = this;

    // Register event listener for back button troughout the app
    //$('#content').on('click', '.header-back-button', function (event) {
    //  window.history.back();
    //  return false;
    //});

    $('#header').append(new gratzi.HeaderView().el);

  },

  home: function (code) {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.homeView) {
      this.homeView = new gratzi.HomeView();
      this.homeView.render();
    } else {
      this.homeView.delegateEvents(); // delegate events when the view is recycled
    }

    $('#header').html(new gratzi.HeaderView().el);
    slidePage(this.homeView);
  },

  auth: function (code) {
    $('#header').html(new gratzi.HeaderView().el);
    var self = this;
    var match = window.location.href.match(/\?code=([a-z0-9]*)/);

    if (match) {
      console.log("Getting access token...");
      $('#content').append("<div class='center'><h1>Loading</h1><img src='/css/images/loading.gif' /></div>");

      git.authenticate(match[1], function (err) {

        if (err)
          console.log("Error authenticating with Git:" + err);
        else {
          console.log("Gettings Git account details...");
          git.load(function (result, data) {
            //if(result != null && result == "err")
            //{
            //    console.log(err);
            //}
            //else
            //console.log(JSON.stringify(data));

            window.location.href = "/#send";

          });
        }
      });
    }
    else if ($.cookie('git-oauth-token'))
      slidePage(new gratzi.SendView());
    else {
      slidePage(new gratzi.ProfileView());
    }

  },

  about: function () {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.aboutView) {
      this.aboutView = new gratzi.AboutView();
      this.aboutView.render();
    } else {
      this.aboutView.delegateEvents(); // delegate events when the view is recycled
    }

    $('#header').html(new gratzi.HeaderView().el);
    $("#about").addClass("active");
    slidePage(this.aboutView);
  },

  send: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#send").addClass("active");
    slidePage(new gratzi.SendView());
  },

  view: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#view").addClass("active");
    slidePage(new gratzi.ProfileView());
  }

});

//templateLoader function defined in utils.js
templateLoader.load(["HomeView", "AboutView", "SendView", "ProfileView", "HeaderView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });