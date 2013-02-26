gratzi.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "send": "send",
    "about": "about",
    "profile": "profile",
    "auth": "auth",
    "signup": "auth"
  },

  initialize: function () {

    var self = this;

    // Register event listener for back button troughout the app
    $('#content').on('click', '.header-back-button', function (event) {
      window.history.back();
      return false;
    });

    $('#header').append(new gratzi.HeaderView().el);

  },

  home: function(code) {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.homeView) {
      this.homeView = new gratzi.HomeView();
      this.homeView.render();
    } else {
      this.homeView.delegateEvents(); // delegate events when the view is recycled
    }
    slidePage(this.homeView);
  },

  auth: function (code) {

    var self = this;
    var match = window.location.href.match(/\?code=([a-z0-9]*)/);

    if (match) {
      console.log("Getting access token...");
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

            //self.slidePage(new gratzi.SendView());

          });
        }
      });
    }
    else
      slidePage(new gratzi.ProfileView());

  },

  about: function () {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.aboutView) {
      this.aboutView = new gratzi.AboutView();
      this.aboutView.render();
    } else {
      this.aboutView.delegateEvents(); // delegate events when the view is recycled
    }
    slidePage(this.aboutView);
  },

  send: function () {
    slidePage(new gratzi.SendView());
  },

  profile: function () {
    slidePage(new gratzi.ProfileView());
  }

});

//templateLoader function defined in utils.js
templateLoader.load(["HomeView", "AboutView", "SendView", "ProfileView", "HeaderView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });