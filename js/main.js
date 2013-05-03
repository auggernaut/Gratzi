gratzi.Router = Backbone.Router.extend({

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

      //Set gratzi.Store
      gratzi.Store = function () {
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
      if (gratzi.Store) {
         gratzi.Store.auth(function (error, profile) {

            if (error) {
               console.log("Error with gratzi.Store.auth" + error);
               gratzi.Store.logout();
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
      // Since the home view never changes, we instantiate it and render it only once
      var dropBoxMatch;
      if (!this.homeView) {
         this.homeView = new gratzi.HomeView();
         this.homeView.render();
      } else {
         this.homeView.delegateEvents();
      }

      $('#header').html(new gratzi.HeaderView().el);
      //$("#home").addClass("active");

      dropBoxMatch = window.location.href.match(/\&dboauth_token=([a-z0-9]*)/);

      if (dropBoxMatch) {

         gratzi.Store = drop;

         //Do Auth
         gratzi.Store.auth(function (error, profile) {
            if (error === "404") {
               console.log("No Profile found. ");
               //window.location.href = "/#profile";
               Backbone.history.navigate("#create");
            }
            else if (error) {
               console.log("Error with gratzi.Store.auth" + error);
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

      $('#footer').html(new gratzi.FooterView().el);


   },

   create: function () {
      "use strict";
      $('#header').html(new gratzi.HeaderView().el);
      $("#create").addClass("active");

      //Is the user logged in?
      if (localStorage.getItem('profile'))
         $('#content').html(new gratzi.CreateView().el);
      else
         $('#content').html(new gratzi.ProfileView().el);

      $('#footer').html(new gratzi.FooterView().el);
   },

   reply: function (params) {

      $('#header').html(new gratzi.HeaderView().el);

//      if (localStorage.getItem('replyLink'))
//         $('#content').html(new gratzi.ReplyView({ "replyLink": localStorage.getItem('replyLink') }).el);
//      else if (params)
      $('#content').html(new gratzi.ReplyView(params).el);

      $('#footer').html(new gratzi.FooterView().el);
   },

   view: function () {
      $('#header').html(new gratzi.HeaderView().el);

      $('#content').html(new gratzi.ListView().el);
      $("#view").addClass("active");

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
