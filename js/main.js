



gratzi.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "send": "send",
    "view": "view",
    "about": "about",
    "profile": "profile",
    "signin": "send",
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
          console.log("Loaded Profile: " + jProf);
        }

      });

  },

  home: function () {
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
          window.location.href = "/#send";
        }
      });

    }
    else {
      utils.slidePage(this.homeView)
    }

  },

  send: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#send").addClass("active");
    if (localStorage.getItem('profile'))
      utils.slidePage(new gratzi.SendView());
    else
      utils.slidePage(new gratzi.ProfileView());
  },

  view: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    $("#view").addClass("active");
    utils.slidePage(new gratzi.ViewView(params));


    // masonry initialization
    $('.main_container').masonry({
      // options
      itemSelector: '.pin',
      isAnimated: true,
      isFitWidth: true
    });

    // onclick event handler (for comments)
    $('.comment_tr').click(function () {
      $(this).toggleClass('disabled');
      $(this).parent().parent().parent().find('form').slideToggle(250, function () {
        $('.main_container').masonry();
      });
    });


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
    utils.slidePage(this.aboutView);
  },

  profile: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    utils.slidePage(new gratzi.ProfileView(params));
  },

});

//templateLoader function defined in utils.js
utils.templateLoader.load(["HomeView", "AboutView", "SendView", "ViewView", "ProfileView", "HeaderView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });