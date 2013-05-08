//************************    PROFILE    *************************//

gratzi.ProfileView = Backbone.View.extend({

   events: {
      "click #logout": "logout",
      "click #dropbox": "authDropBox",
      "click #save": "saveProfile",
      "change #file": "pickFile",
      "click #betaCode-submit": "checkCode"
   },

   initialize: function () {
      console.log('Initializing ProfileView');
      this.render();
   },

   render: function () {

      if (localStorage.getItem('authenticated')) {

         //Load logged in user profile
         if (localStorage.getItem('profile')) {
            var profile = JSON.parse(localStorage.getItem('profile'));
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

      store = drop;

      store.auth(function (error, profile) {
         if (profile) {
            var jProf = JSON.stringify(profile);
            console.log("Auth returned: " + jProf);
            localStorage.setItem("profile", jProf);
            window.location.href = "/#create";
         }
         else if (error == "404") {
            console.log("No Profile found. ");
            window.location.reload();
         } else {
            console.log("Auth failed: " + error);
         }

      });

   },

   pickFile: function (e) {
      $('#pretty-input').val($('input[id = file]').val().replace("C:\\fakepath\\", ""));
   },

   saveProfile: function () {

      var $save = $("#save");

      $save.attr("disabled", "disabled");
      $save.html("Saving...");


      //ADD IMAGE
      //http://www.html5rocks.com/en/tutorials/file/dndfiles/
      var files = $('input[id = file]')[0].files; // FileList object
      var fileName = $('#pretty-input').val();

      // Loop through the FileList
      for (var i = 0, f; f = files[i]; i++) {
         // Only process image files.
         if (!f.type.match('image.*')) {
            continue;
         }

         var reader = new FileReader();
         // Closure to capture the file information.
         reader.onload = (function (theFile) {
            fileName = theFile.name;
            return function (e) {

               gratzi.Store.addImage(e.target.result, theFile.name, function (path) {
                  console.log("Image Uploaded: " + path);
               });

            };
         })(f);

         reader.readAsArrayBuffer(f);
      }


      //SAVE NEW PROFILE
      var newProfile = {
         "userid": localStorage.getItem("userId"),
         "email": localStorage.getItem("email"),
         "fullname": $('#fullname').val(),
         "bio": $('#bio').val(),
         "image": fileName,
         "ui": gratzi.Client.url
      }


      gratzi.Store.saveMyProfile(newProfile, function (path) {
         console.log("Profile Saved: " + path);


         gratzi.Store.loadUser(function (error, profile) {

            if (!error) {
               console.log("Profile Loaded: " + profile);
               $save.removeAttr("disabled");
               $save.html("Save");
               $('#info').show().html("Profile saved!");

               profile.url = path;
               var jProf = JSON.stringify(profile);
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
      var codes = gratzi.Client.betaCodes.split(','), found;
      _.each(codes, function (code) {
         if (code.trim() == $("#betaCode").val()) {
            found = code;
         }
      });

      if (found) {
         $("#divDB").show();
         $("#betaCode").hide();
         $("#betaCode-submit").hide();
         $("#fail").hide();
         ga('set', 'dimension1', found);   //BetaCode custom dimension in Google Analytics
      }
      else {
         $("#fail").show().html("Invalid code.");

      }


   },

   logout: function () {
      gratzi.Store.logout();
      //window.location.href = "/#";
   }

});

