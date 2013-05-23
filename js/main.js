/*global Backbone, utils, Gratzi, ga, git, drop */

Gratzi.Router = Backbone.Router.extend({

   routes: {
      "": "home",
      "create": "create",
      "view": "view",
      "reply": "reply",
      "about": "about",
      "privacy": "privacy",
      "profile": "profile",
      "signin": "create",
      ":code": "home"
   },

   initialize: function () {
      "use strict";
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
               //localStorage.setItem("profile", JSON.stringify(profile));
               console.log("Loaded Profile");
               //window.location.href = "/#create";
               //Backbone.history.navigate("#");
            }

         });
      }


   },

   home: function () {
      "use strict";
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
      $('#feedback').html(new Gratzi.FeedbackView().el);

      dropBoxMatch = window.location.href.match(/\&dboauth_token=([a-z0-9]*)/);

      if (dropBoxMatch) {

         Gratzi.Store = drop;

         //Do Auth
         Gratzi.Store.auth(function (error, profile) {

            if (profile || error === "404") {
               //Auth success
               var jProf;

               //Load profile if exists
               if (profile) {
                  jProf = JSON.stringify(profile.json());
                  localStorage.setItem("profile", jProf);
                  console.log("Loaded Profile: " + jProf);
               }
               else {
                  //profile doesn't yet exist
                  console.log("No Profile found. ");
                  jProf = localStorage.getItem("profile");

                  //Could be a new user, connected after replying to a grat.
                  if (jProf) {
                     //Create Profile with reply sender data
                     Gratzi.Store.saveProfile(JSON.parse(jProf), function (path) {
                        console.log("Profile Created: " + path);

                     });
                  }

               }


               var jZi = localStorage.getItem("jZi");
               var jGrat = localStorage.getItem("jGrat");
               var loc = localStorage.getItem("loc");

               if (loc) {
                  //User logged in after the reply screen

                  if (jZi) {
                     //Zi has already been created/viewed

                     if (jGrat) {
                        //User sent a Zi, then logged in
                        Gratzi.Store.saveJSONP(JSON.parse(jGrat), function (gPath) {

                           localStorage.removeItem("jGrat");

                           Gratzi.Store.saveJSONP(JSON.parse(jZi), function (zPath) {

                              localStorage.removeItem("jZi");
                              localStorage.removeItem("loc");

                              Gratzi.Store.loadGratzi(function () {
                                 window.location.href = "#view";
                              });
                           });

                        });
                     }
                     else {
                        //User viewed Zi, then logged in
                        Gratzi.Store.saveJSONP(JSON.parse(jZi), function (zPath) {

                           localStorage.removeItem("jZi");
                           localStorage.removeItem("loc");

                           Gratzi.Store.loadGratzi(function () {
                              window.location.href = "#view";
                           });
                        });

                     }
                  } else if (jGrat) {
                     //Zi hasn't yet been created

                     //User viewed Grat, then logged in
                     Gratzi.Store.saveJSONP(JSON.parse(jGrat), function (gPath) {

                        localStorage.removeItem("jGrat");

                        //Load partial gratzi
                        window.location.href = "#reply?loc=" + loc;
                     });

                  }
               }
               else {
                  //User just logged in from Login screen
                  window.location.href = "/#create";
               }

            } else {
               //Auth fail... TODO: handle
               console.log("Auth failed: " + error);
            }

         });

      }
      else {
         //Not a Dropbox redirect, load home
         $('#content').html(this.homeView.el);
      }

      $('#footer').html(new Gratzi.FooterView().el);


   },

   create: function () {
      "use strict";

      $('#header').html(new Gratzi.HeaderView().el);
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $("#create").addClass("active");

      //Is the user logged in?
      if (localStorage.getItem('profile')) {
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
      "use strict";

      ga('send', 'pageview', {
         'page': '/#reply',
         'title': 'Reply'
      });

      //?loc=' + params.loc

      $('#header').html(new Gratzi.HeaderView().el);
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $('#content').html(new Gratzi.ReplyView(params).el);
      $('#footer').html(new Gratzi.FooterView().el);
   },

   view: function () {
      "use strict";

      ga('send', 'pageview', {
         'page': '/#view',
         'title': 'View'
      });

      $('#header').html(new Gratzi.HeaderView().el);
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $('#content').html(new Gratzi.ListView().el);
      $('#footer').html(new Gratzi.FooterView().el);

      $("#view").addClass("active");

   },

   about: function () {
      "use strict";

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
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $('#content').html(this.aboutView.el);
      $('#footer').html(new Gratzi.FooterView().el);
   },

   privacy: function () {
      "use strict";

      ga('send', 'pageview', {
         'page': '/#privacy',
         'title': 'Privacy'
      });

      // Since the about view never changes, we instantiate it and render it only once
      if (!this.privacyView) {
         this.privacyView = new Gratzi.PrivacyView();
         this.privacyView.render();
      } else {
         this.privacyView.delegateEvents();
      }

      $('#header').html(new Gratzi.HeaderView().el);
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $('#content').html(this.privacyView.el);
      $('#footer').html(new Gratzi.FooterView().el);
   },


   profile: function (params) {
      "use strict";

      ga('send', 'pageview', {
         'page': '/#profile',
         'title': 'Profile'
      });

      $('#header').html(new Gratzi.HeaderView().el);
      $('#feedback').html(new Gratzi.FeedbackView().el);
      $('#content').html(new Gratzi.ProfileView(params).el);
      $('#footer').html(new Gratzi.FooterView().el);
   }

});

//templateLoader function defined in utils.js
utils.templateLoader.load(["HomeView", "AboutView", "PrivacyView", "CreateView", "FeedbackView", "ReplyView", "ListView", "ListItemView", "ProfileView", "HeaderView", "FooterView"],
   function () {
      "use strict";

      var GratziRouter = new Gratzi.Router();
      Backbone.history.start();
   });


//FACEBOOK JAVSCRIPT API STUFFS
window.fbAsyncInit = function () {
   "use strict";

   FB.init({ appId: '295452973919932', status: true, cookie: false, xfbml: false, oauth: true });

};

(function () {
   "use strict";

   var e = document.createElement('script');
   e.async = true;
   e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
   document.getElementById('fb-root').appendChild(e);
}());
