/*global Backbone, Gratzi, _, ga, drop, email, utils, s3 */

//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {
   "use strict";

   localStorage.setItem("cbGrat", JSON.stringify(json));

   var sender = new Gratzi.Profile();
   sender.load(json.sender);

   var recipient = new Gratzi.Profile();
   recipient.load(json.recipient);

   $('#gName').append(sender.fullName);
   $('#gMessage').append(json.message);
   $('#gTags').append(json.tags);
   $('#gImage').attr("src", sender.image);
   $('#saveForm').css('display', 'none');


   if (recipient.image) {
      $('#zImage').attr('src', recipient.image);
   }

   if (recipient.fullName) {
      // Grat created with Facebook photo
      $('#zName').html(recipient.fullName);
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
      $('#zName').html(recipient.email);
   }


}

function ziCallback(json) {
   "use strict";

   localStorage.setItem("cbZi", JSON.stringify(json));

   var sender = new Gratzi.Profile();
   sender.load(json.sender);

   $('#zName').append(sender.fullName);
   $('#zMessage').append(json.message);
   $('#zTags').append(json.tags);
   $('#zImage').attr("src", sender.image);
   $('#btnPickImg').hide();

   if (localStorage.getItem('authenticated')) {

      $('#sendForm').hide();
      //$('#auth').hide();
      $('#grat').show();

      var gLink = json.grat;
      var index = gLink.lastIndexOf("/");
      var gFileName = gLink.substr(index + 1);

      Gratzi.Store.getFile(gFileName, function (file) {

         var recipient = new Gratzi.Profile();
         recipient.load(file.sender);

         $('#gName').append(recipient.fullName);
         $('#gMessage').append(file.message);
         $('#gTags').append(file.tags);
         $('#gImage').attr("src", recipient.image);
      });

   }
   else {
      $('#grat').hide();
      //$('#auth').show();
      $('#gName').append("Login to view Grat.");
      $('#sendForm').hide();
   }


}


//*********************  REPLY   ***************************//
Gratzi.ReplyView = Backbone.View.extend({

   events: {
      "click #btnSend": "sendZi",
      "click #btnSave": "saveZi",
      /*"change #upImage": "uploadToImgur",*/
      "click #dropbox": "authDropBox",
      'change #upImage': 'pickImage',
      'change #fullname': 'changeName',
      'change #response': 'changeResponse'
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

      if (!localStorage.getItem('authenticated')) {
         //If not logged in send to S3.
         Gratzi.Store = s3;
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
      var sender, recipient, newZi;


      $btnSend.attr("disabled", "disabled");
      $btnSend.html("Sending...");

      sender = new Gratzi.Profile();
      sender.load(cbGrat.recipient);
      sender.fullName = $('#zName').html();
      sender.image =  $("#zImage").attr("src");

      recipient = new Gratzi.Profile();
      recipient.load(cbGrat.sender);

      newZi = new Gratzi.Zi(
         sender.json(),
         recipient.json(),
         localStorage.getItem("loc"),
         $('#response').val(),
         $('#tags').val()
      );

      //Save Grat
      Gratzi.Store.saveJSONP(cbGrat, function (gPath) {

         console.log("Grat stored: " + gPath);

         var jZi = newZi.json();

         //Save Zi
         Gratzi.Store.saveJSONP(jZi, function (res) {

            if (res === "Failure") {

               $('#fail').show().html("Failed to save Zi.");
               $btnSend.removeAttr("disabled");
               $btnSend.html("Send");

            } else {

               //Get Public Link to new Zi
               Gratzi.Store.getLink(res, function (url) {

                  var ziLink = Gratzi.Servers.fileServer + "/#reply?loc=" + utils.utf8_to_b64(url);

                  //Email Grat creator
                  email.sendZi(jZi, ziLink, function (res) {
                     if (res === "Success") {
                        $btnSend.removeAttr("disabled");
                        $btnSend.html("Send");
                        $('#info').show().html("Zi sent!");
                        $('#zMessage').html($('#response').val());
                        $('#zTags').html($('#tags').val());

                        $('#sendForm').hide();
                        $("#btnPickImg").hide();

                        if (!localStorage.getItem('authenticated')) {
                           localStorage.setItem("s3Zi", jZi);
                           $('#divDB').show();
                        }
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

         //TODO: handle upload error
         console.log("Image Uploaded: " + path);

         Gratzi.Store.getLink(path, function (imgUrl) {
            $('#zImage').attr("src", imgUrl);
            $btnPick.removeAttr("disabled");
            $btnPick.html("Change Image");

         });
      });
   },

   changeName: function (e) {
      "use strict";

      var val = $(e.currentTarget).val();
      $("#zName").html(val);

   },

   changeResponse: function (e) {
      "use strict";

      var val = $(e.currentTarget).val();
      $("#zMessage").html(val);

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
