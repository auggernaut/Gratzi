



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
      //utils.slidePage(this.homeView);
      $('#content').html(this.homeView.el);
    }

    $('#footer').html(new gratzi.FooterView().el);


  },

  create: function () {
    $('#header').html(new gratzi.HeaderView().el);
    $("#create").addClass("active");
    if (localStorage.getItem('profile'))
      //utils.slidePage(new gratzi.CreateView());
      $('#content').html(new gratzi.CreateView().el);
    else
      //utils.slidePage(new gratzi.ProfileView());
      $('#content').html(new gratzi.ProfileView().el);

    $('#footer').html(new gratzi.FooterView().el);
  },

  view: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    $("#view").addClass("active");

    //utils.slidePage(new gratzi.ViewView(params));

    $('#content').html(new gratzi.ViewView(params).el);

    var $container = $('.main_container');

    $container.imagesLoaded(function () {
      $container.masonry({
        itemSelector: '.pin',
        isAnimated: true,
        isFitWidth: true
      });
    });

    $('.actions').click(function () {
      $(this).children().toggleClass('icon-chevron-up icon-chevron-down');

      $(this).parent().find('.zi').slideToggle(250, function () {
        $('.main_container').masonry();
      });
    });

    $('#footer').html(new gratzi.FooterView().el);

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
    //utils.slidePage(this.aboutView);
    $('#content').html(this.aboutView.el);
    $('#footer').html(new gratzi.FooterView().el);
  },


  profile: function (params) {
    $('#header').html(new gratzi.HeaderView().el);
    //utils.slidePage(new gratzi.ProfileView(params));
    $('#content').html(new gratzi.ProfileView(params).el);
    $('#footer').html(new gratzi.FooterView().el);
  },

});

//templateLoader function defined in utils.js
utils.templateLoader.load(["HomeView", "AboutView", "CreateView", "ViewView", "ProfileView", "HeaderView", "FooterView"],
    function () {
      app = new gratzi.Router();
      Backbone.history.start();
    });