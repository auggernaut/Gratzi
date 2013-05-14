Gratzi.Router = Backbone.Router.extend({

   routes: {
      "": "home",
      "create": "create",
      "view": "view",
      "reply": "reply",
      "about": "about",
      "profile": "profile",
      "signin": "create",
      ":code": "home"
   },

   initialize: function () {

      //Set Gratzi.Store
      Gratzi.Store = function () {
         var authed = localStorage.getItem('authenticated');
         if (authed) {

            if (authed === 'github') {
               return git;
            }
            else if (authed === 'dropbox') {
               return drop;
            }
         }
         return null;
      }();


      //Do/Redo Auth
      if (Gratzi.Store) {
         Gratzi.Store.auth(function (error, profile) {

            if (error) {
               console.log("Error with Gratzi.Store.auth" + error);
               Gratzi.Store.logout();
               window.location.href = "/#";
               return;
            } else {
               //var jProf = JSON.stringify(profile);
               //localStorage.setItem("profile", jProf);
               console.log("Loaded Profile");
               //window.location.href = "/#create";
               //Backbone.history.navigate("#");
            }

         });
      }

   },

   home: function () {
      ga('send', 'pageview', {
         'page': '/#',
         'title': 'Home'
      });

      // Since the home view never changes, we instantiate it and render it only once
      var dropBoxMatch;
      if (!this.homeView) {
         this.homeView = new Gratzi.HomeView();
         this.homeView.render();
      } else {
         this.homeView.delegateEvents();
      }

      $('#header').html(new Gratzi.HeaderView().el);

      dropBoxMatch = window.location.href.match(/\&dboauth_token=([a-z0-9]*)/);

      if (dropBoxMatch) {

         Gratzi.Store = drop;

         //Do Auth
         Gratzi.Store.auth(function (error, profile) {
            if (error === "404") {
               console.log("No Profile found. ");
               window.location.href = "/#profile";
               //Backbone.history.navigate("#profile");
            }
            else if (error) {
               console.log("Error with Gratzi.Store.auth" + error);
               return;
            }
            else if (profile) {
               var jProf = JSON.stringify(profile);
               localStorage.setItem("profile", jProf);
               console.log("Loaded Profile: " + jProf);
               if (localStorage.getItem('loc'))
                  window.location.href = "#reply?loc=" + localStorage.getItem('loc');
               else
                  window.location.href = "/#create";
                  //Backbone.history.navigate("#create");
            }
         });

      }
      else {
         $('#content').html(this.homeView.el);
      }

      $('#footer').html(new Gratzi.FooterView().el);


   },

   create: function () {

      "use strict";
      $('#header').html(new Gratzi.HeaderView().el);
      $("#create").addClass("active");

      //Is the user logged in?
      if (localStorage.getItem('profile')){
         ga('send', 'pageview', {
            'page': '/#create',
            'title': 'Create'
         });
         $('#content').html(new Gratzi.CreateView().el);
      } else {
         ga('send', 'pageview', {
            'page': '/#signin',
            'title': 'Sign In'
         });
         $('#content').html(new Gratzi.ProfileView().el);
      }

      $('#footer').html(new Gratzi.FooterView().el);
   },

   reply: function (params) {

      ga('send', 'pageview', {
         'page': '/#reply',
         'title': 'Reply'
      });

      //?loc=' + params.loc

      $('#header').html(new Gratzi.HeaderView().el);
      $('#content').html(new Gratzi.ReplyView(params).el);
      $('#footer').html(new Gratzi.FooterView().el);
   },

   view: function () {

      ga('send', 'pageview', {
         'page': '/#view',
         'title': 'View'
      });

      $('#header').html(new Gratzi.HeaderView().el);
      $('#content').html(new Gratzi.ListView().el);
      $('#footer').html(new Gratzi.FooterView().el);

      $("#view").addClass("active");

   },

   about: function () {

      ga('send', 'pageview', {
         'page': '/#about',
         'title': 'About'
      });

      // Since the about view never changes, we instantiate it and render it only once
      if (!this.aboutView) {
         this.aboutView = new Gratzi.AboutView();
         this.aboutView.render();
      } else {
         this.aboutView.delegateEvents();
      }

      $('#header').html(new Gratzi.HeaderView().el);
      $('#content').html(this.aboutView.el);
      $('#footer').html(new Gratzi.FooterView().el);

      $("#about").addClass("active");
   },


   profile: function (params) {

      ga('send', 'pageview', {
         'page': '/#profile',
         'title': 'Profile'
      });

      $('#header').html(new Gratzi.HeaderView().el);
      $('#content').html(new Gratzi.ProfileView(params).el);
      $('#footer').html(new Gratzi.FooterView().el);
   }

});

//templateLoader function defined in utils.js
utils.templateLoader.load(["HomeView", "AboutView", "CreateView", "ReplyView", "ListView", "ListItemView", "ProfileView", "HeaderView", "FooterView"],
   function () {
      app = new Gratzi.Router();
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
