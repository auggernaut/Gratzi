/*global Backbone, Gratzi, _, ga, drop */

//************************    PROFILE    *************************//

Gratzi.ProfileView = Backbone.View.extend({

   events: {
      "click #logout": "logout",
      "click #dropbox": "authDropBox",
      "click #save": "saveProfile",
      "change #upImage": "pickFile",
      "click #betaCode-submit": "checkCode"
   },

   initialize: function () {
      "use strict";
      console.log('Initializing ProfileView');
      this.render();
   },

   render: function () {
      "use strict";
      if (localStorage.getItem('authenticated')) {

         //Load logged in user profile
         if (localStorage.getItem('profile')) {
            var profile = new Gratzi.Profile();
            profile.load(JSON.parse(localStorage.getItem('profile')));
            $(this.el).html(this.template({  profile: profile }));
         }
         else {
            $(this.el).html(this.template());
         }

      }
      else {
         //Not logged in
         $(this.el).html(this.template());
      }

      return this;

   },

   authDropBox: function () {
      "use strict";

      ga('send', {
         'hitType': 'event',
         'eventCategory': 'button',
         'eventAction': 'click',
         'eventLabel': 'authDropBoxProf',
         'eventValue': 1
      });

      Gratzi.Store = drop;
      Gratzi.Store.auth();

   },

   pickFile: function (e) {
      "use strict";
      $('#pretty-input').val($('input[id = upImage]').val().replace("C:\\fakepath\\", ""));
   },

   saveProfile: function () {
      "use strict";

      ga('send', {
         'hitType': 'event',
         'eventCategory': 'button',
         'eventAction': 'click',
         'eventLabel': 'saveProfile',
         'eventValue': 1
      });

      var $save = $("#save");
      $save.attr("disabled", "disabled");
      $save.html("Saving...");

      //Save Image
      var files = $('input[id = upImage]')[0].files;
      var file = files[0];
      if (!file || !file.type.match(/image.*/)){ return; }
      Gratzi.Store.saveImage(file, file.name, function (path) {
         console.log("Image Uploaded: " + path);
      });

      //Create Profile

      var newProfile = new Gratzi.Profile();
      newProfile.email = localStorage.getItem("email");
      newProfile.fullName = $('#fullname').val();
      newProfile.image = file.name;
      newProfile.bio = $('#bio').html();

      //Save Profile
      Gratzi.Store.saveProfile(newProfile.json(), function (path) {
         console.log("Profile Saved: " + path);

         Gratzi.Store.loadUser(function (error, profile) {

            if (!error) {
               console.log("Profile Loaded: " + profile);
               $save.removeAttr("disabled");
               $save.html("Save");
               $('#info').show().html("Profile saved!");

               profile.url = path;
               var jProf = JSON.stringify(profile.json());
               localStorage.setItem("profile", jProf);
               window.location.href = "/#create";
            }
            else {
               $save.removeAttr("disabled");
               $save.html("Save");
               $('#info').show().html("Save failed!");
            }

            //Backbone.history.navigate("#create");

         });

      });


   },

   checkCode: function () {
      "use strict";
      var codes = Gratzi.Client.betaCodes.split(','), found = false;
      _.each(codes, function (code) {
         if (code.trim() === $("#betaCode").val()) {
            found = code.trim();
         }
      });

      if (found) {
         $("#divDB").show();
         $("#betaCode").hide();
         $("#betaCode-submit").hide();
         $("#fail").hide();
         ga('set', 'dimension1', found);   //BetaCode custom dimension in Google Analytics
         ga('send', {
            'hitType': 'event',
            'eventCategory': 'button',
            'eventAction': 'click',
            'eventLabel': 'CodeLogin',
            'eventValue': 1
         });
      }
      else {
         $("#fail").show().html("Invalid code.");

      }


   },

   logout: function () {
      "use strict";
      Gratzi.Store.logout();
      //window.location.href = "/#";
   }

});

