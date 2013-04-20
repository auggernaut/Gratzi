



gratzi.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "create": "create",
    "view": "view",
    "about": "about",
    "profile": "profile",
    "signin": "create",
    ":code": "home"
  },

  initialize: function () {

    var self = this;

    //On page load/reload


    //Set gratzi.Store
    gratzi.Store = function () {
      var authed = localStorage.getItem('authenticated');
      if (authed) {

        if (authed == 'github') {
          return git;
        }
        else if (authed == 'dropbox') {
          return drop;
        }
      }
      return null;
    }();



    //Do/Redo Auth
    if (gratzi.Store)
      gratzi.Store.auth(function (error, profile) {

        if (error) {
          console.log("Error with gratzi.Store.auth" + error);
          gratzi.Store.logout();
          window.location.href = "/#";
          return;
        }
        else {
          var jProf = JSON.stringify(profile);
          //localStorage.setItem("profile", jProf);
          console.log("Loaded Profile");
        }

      });

  },

  home: function () {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.homeView) {
      this.homeView = new gratzi.HomeView();
      this.homeView.render();
    } else {
      this.homeView.delegateEvents();
    }

    $('#header').html(new gratzi.HeaderView().el);
    $("#home").addClass("active");
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
            window.location.href = "/#create";
          });
        }
      });
    }
    else if (dropBoxMatch) {

      gratzi.Store = drop;

      //Do Auth
      gratzi.Store.auth(function (error, profile) {
        if (error == "404") {
          console.log("No Profile found. ");
          window.location.href = "/#profile";
        }
        else if (error) {
          console.log("Error with gratzi.Store.auth" + error);
          return;
        }
        else {
          var jProf = JSON.stringify(profile);
          localStorage.setItem("profile", jProf);
          console.log("Loaded Profile: " + jProf);
          window.location.href = "/#create";
        }
      });

    }
    else {
      $('#content').html(this.homeView.el);
    }

    $('#footer').html(new gratzi.FooterView().el);


  },

  create: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#create").addClass("active");
    if (localStorage.getItem('profile'))
      $('#content').html(new gratzi.CreateView().el);
    else
      $('#content').html(new gratzi.ProfileView().el);

    $('#footer').html(new gratzi.FooterView().el);
  },

  view: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    

    if (params)
      $('#content').html(new gratzi.ReplyView(params).el);
    else {
      $('#content').html(new gratzi.ListView(params).el);
      $("#view").addClass("active");
    }

    $('#footer').html(new gratzi.FooterView().el);

  },

  about: function () {
    // Since the about view never changes, we instantiate it and render it only once
    if (!this.aboutView) {
      this.aboutView = new gratzi.AboutView();
      this.aboutView.render();
    } else {
      this.aboutView.delegateEvents();
    }

    $('#header').html(new gratzi.HeaderView().el);
    $("#about").addClass("active");
    $('#content').html(this.aboutView.el);
    $('#footer').html(new gratzi.FooterView().el);
  },


  profile: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    $('#content').html(new gratzi.ProfileView(params).el);
    $('#footer').html(new gratzi.FooterView().el);
  },

});

//templateLoader function defined in utils.js
utils.templateLoader.load(["HomeView", "AboutView", "CreateView", "ReplyView", "ListView", "ListItemView", "ProfileView", "HeaderView", "FooterView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });



//FACEBOOK JAVSCRIPT API STUFFS
window.fbAsyncInit = function () {

  FB.init({ appId: '295452973919932', status: true, cookie: false, xfbml: false, oauth: true });

};

(function () {
  var e = document.createElement('script');
  e.async = true;
  e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
  document.getElementById('fb-root').appendChild(e);
}());
