/*global Backbone, Gratzi, _, ga, drop, email, utils, s3 */

//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {
   "use strict";

   $('#gName').append(json.sender.fullname);
   $('#gMessage').append(json.message);
   $('#gTags').append(json.tags);
   $('#gImage').attr("src", json.sender.image);
   localStorage.setItem("cbGrat", JSON.stringify(json));
   //$('#auth').hide();
   $('#saveForm').css('display', 'none');

   //Profile details:
   //var prof = JSON.parse(localStorage.getItem("profile"));
   //$('#zName').append(prof.fullname);
   //$('#zImage').attr("src", prof.image);

   if (json.recipient.image) {
      $('#zImage').attr('src', json.recipient.image);
   }

   if (json.recipient.fullname) {
      // Grat created with Facebook photo
      $('#zName').html(json.recipient.fullname);
      $('#fullname').css('display', 'none');
   } else if (localStorage.getItem('authenticated')) {
      // If not, and the user it logged in, use their profile info
      var prof = JSON.parse(localStorage.getItem("profile"));
      $('#zName').html(prof.fullname);
      $('#zImage').attr("src", prof.image);
      $('#fullname').css('display', 'none');
   }
   else {
      // Else, just show the email the grat was sent to in name field
      $('#zName').html(json.recipient.email);
   }


}

function ziCallback(json) {
   "use strict";

   $('#zName').append(json.sender.fullname);
   $('#zMessage').append(json.message);
   $('#zTags').append(json.tags);
   $('#zImage').attr("src", json.sender.image);
   $('#btnPickImg').hide();
   localStorage.setItem("cbZi", JSON.stringify(json));

   var gLink = json.grat;
   var index = gLink.lastIndexOf("/");
   var gFileName = gLink.substr(index + 1);

   if (localStorage.getItem('authenticated')) {

      $('#sendForm').hide();
      //$('#auth').hide();
      $('#grat').show();

      Gratzi.Store.getFile(gFileName, function (file) {
         $('#gTo').append(file.sender);
         $('#gName').append(file.sender.fullname);
         $('#gMessage').append(file.message);
         $('#gTags').append(file.tags);
         $('#gImage').attr("src", file.sender.image);
      });

   }
   else {
      $('#grat').hide();
      //$('#auth').show();
      $('#gName').append("Login to view Grat.");

   }


}


//*********************  REPLY   ***************************//
Gratzi.ReplyView = Backbone.View.extend({

   events: {
      "click #btnSend": "sendZi",
      "click #btnSave": "saveZi",
      "change #upImage": "uploadToImgur",
      "click #dropbox": "authDropBox",
      'click #btnPickImg': 'pickImage'
   },

   initialize: function () {
      "use strict";
      console.log('Initializing Reply View');
      this.render();
   },

   render: function () {
      "use strict";
      var cbScript, url;

      if (this.options && (this.options.loc)) {
         url = utils.b64_to_utf8(this.options.loc);

         //JSONP Callback
         cbScript = "<script type='text/javascript' src='" + url + "'></script>";

         localStorage.setItem("loc", this.options.loc);

      }

      $(this.el).html(this.template({ script: cbScript }));
      return this;

   },

   authDropBox: function () {
      "use strict";

      Gratzi.Store = drop;
      Gratzi.Store.auth(function (error, profile) {
         if (profile) {
            var jProf = JSON.stringify(profile);
            console.log("Auth returned: " + jProf);
            localStorage.setItem("profile", jProf);
            //window.location.href = "/#create";
            window.location.reload();
         }
         else if (error === "404") {
            console.log("No Profile found. ");
            window.location.href = "/#profile";
         } else {
            console.log("Auth failed: " + error);
         }
      });

   },


   sendZi: function () {
      "use strict";

      var $btnSend = $("#btnSend");
      var cbGrat = JSON.parse(localStorage.getItem("cbGrat"));
      var sender, newZi;
      var nameParts = $('#zName').html().split(" ");

      $btnSend.attr("disabled", "disabled");
      $btnSend.html("Sending...");


      if (!localStorage.getItem('authenticated')) {
         //If not logged in send to S3.
         Gratzi.Store = s3;
      }

      sender = new Gratzi.Profile(
         cbGrat.recipient.userType,
         nameParts[0],
         nameParts[1],
         cbGrat.recipient.username,
         $("#zImage").attr("src")
      );


      newZi = new Gratzi.Zi(
         sender.json,
         cbGrat.sender,
         localStorage.getItem("loc"),
         $('#response').val(),
         ""
      );

      //Save Grat
      Gratzi.Store.saveJSONP(cbGrat, function (gPath) {

         console.log("Grat stored: " + gPath);

         //Save Zi
         Gratzi.Store.saveJSONP(newZi.json, function (res) {

            if (res === "Failure") {

               $('#fail').show().html("Failed to save Zi.");
               $btnSend.removeAttr("disabled");
               $btnSend.html("Send");

            } else {

               //Get Public Link to new Zi
               Gratzi.Store.getLink(res, function (url) {

                  var ziLink = Gratzi.Servers.fileServer + "/#reply?loc=" + utils.utf8_to_b64(url);

                  //Email Grat creator
                  email.sendZi(newZi, ziLink, function (res) {
                     if (res === "Success") {
                        $btnSend.removeAttr("disabled");
                        $btnSend.html("Send");
                        $('#info').show().html("Zi sent!");
                        $('#zMessage').html($('#response').val());
                        $('#zTags').html($('#tags').val());

                        $('#sendForm').hide();
                        $("#btnPickImg").hide();
                     }
                     else {
                        $('#fail').show().html("Failed to email Zi.");
                        $btnSend.removeAttr("disabled");
                        $btnSend.html("Send");
                     }
                  });

               });
            }

         });
      });
   },


   saveZi: function () {
      "use strict";

      var $btnSave = $("#btnSave");
      $btnSave.attr("disabled", "disabled");
      $btnSave.html("Saving...");

      var cbZi = JSON.parse(localStorage.getItem("cbZi"));

      if (localStorage.getItem('authenticated')) {

         //Store Grat
         Gratzi.Store.saveJSONP(cbZi, function (path) {
            console.log("Zi stored: " + path);
            $('#saveForm').hide();
            $('#info').show().html("Zi Saved!");

            //TODO: add new grat to grats in localStorage
         });

      } else {
         //Redirect to login
         window.location.href = "/#profile";
      }

   },

   pickImage: function () {
      "use strict";

      var $btnPick = $("#btnPickImg");
      $btnPick.attr("disabled", "disabled");
      $btnPick.html("Uploading...");

      var files = $('input[id = upImage]')[0].files;
      var file = files[0];
      if (!file || !file.type.match(/image.*/)) {
         $btnPick.removeAttr("disabled");
         $btnPick.html("Change Image");
         return;
      }

      Gratzi.Store.saveImage(file, file.name, function (path) {
         console.log("Image Uploaded: " + path);

         Gratzi.Store.getLink(path, function (imgUrl) {
            $('#zImage').attr("src", imgUrl);
            $btnPick.removeAttr("disabled");
            $btnPick.html("Change Image");

         });
      });
   },

   uploadToImgur: function () {
      "use strict";

      //ADD IMAGE
      //http://hacks.mozilla.org/2011/03/the-shortest-image-uploader-ever/
      var files = $('input[id = upImage]')[0].files;
      var file = files[0];
      if (!file || !file.type.match(/image.*/)) {
         return;
      }

      var fd = new FormData();
      fd.append("image", file);
      fd.append("type", "file");
      fd.append("name", "test");
      fd.append("description", "tests");

      var xhr = new XMLHttpRequest();

      xhr.open("POST", "https://api.imgur.com/3/image"); // Boooom!
      xhr.setRequestHeader("Authorization", "Client-ID 0ea1384c01b6dcf");
      xhr.onload = function () {
         var url = JSON.parse(xhr.responseText).data.link;
         $("#zImage").attr("src", url);
      };
      xhr.send(fd);

   }


})
;
