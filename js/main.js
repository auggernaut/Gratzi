gratzi.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "send": "send",
    "view": "view",
    "about": "about",
    "profile": "profile",
    "signin": "send",
    ":code": "home",
  },

  initialize: function () {

    var self = this;

    // Register event listener for back button troughout the app
    //$('#content').on('click', '.header-back-button', function (event) {
    //  window.history.back();
    //  return false;
    //});

    //$('#header').append(new gratzi.HeaderView().el);

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
    var self = this;
    var gitMatch = window.location.href.match(/\?code=([a-z0-9]*)/);
    var dropBoxMatch = window.location.href.match(/\&dboauth_token=([a-z0-9]*)/);

    if (gitMatch) {
      console.log("Getting GitHub access token...");
      $('#content').append("<div class='center'><h1>Loading</h1><img src='/css/images/loading.gif' /></div>");
      git.authenticate(gitMatch[1], function (err) {
        if (err)
          console.log("Error authenticating with GitHub:" + err);
        else {
          console.log("Gettings GitHub account details...");
          git.load(function (result, data) {
            window.location.href = "/#send";
          });
        }
      });
    }
    else if (dropBoxMatch) {
      console.log("Got DropBox access token: " + dropBoxMatch[1]);
      drop.authenticate(function () {
        console.log("Getting DropBox account details...");
        drop.load(function (res) {
          console.log(res);
          window.location.href = "/#send";
        });
      });
    }
    else {
      slidePage(this.homeView)
    }

  },

  send: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#send").addClass("active");
    if ($.cookie('authenticated')) 
      slidePage(new gratzi.SendView());
    else
      slidePage(new gratzi.ProfileView());
  },

  view: function (url) {
    $('#header').html(new gratzi.HeaderView().el);
    $("#view").addClass("active");
    slidePage(new gratzi.ViewView());
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

  profile: function () {
    $('#header').html(new gratzi.HeaderView().el);
    slidePage(new gratzi.ProfileView());
  },

});

//templateLoader function defined in utils.js
templateLoader.load(["HomeView", "AboutView", "SendView", "ViewView", "ProfileView", "HeaderView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });