//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {


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

   if (json.recipient.image)
      $('#zImage').attr('src', json.recipient.image);


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

      gratzi.Store.getFile(gFileName, function (file) {
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
gratzi.ReplyView = Backbone.View.extend({

   events: {
      "click #btnSend": "sendZi",
      "click #btnSave": "saveZi",
      "change #upImage": "uploadToImgur",
      "click #dropbox": "authDropBox",
      'click #btnPickImg': 'pickImage'
   },

   initialize: function () {
      console.log('Initializing Reply View');
      this.render();

   },

   render: function () {

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

      gratzi.Store = drop;

      gratzi.Store.auth(function (error, profile) {
         if (profile) {
            var jProf = JSON.stringify(profile);
            console.log("Auth returned: " + jProf);
            localStorage.setItem("profile", jProf);
            //window.location.href = "/#create";
            window.location.reload();
         }
         else if (error == "404") {
            console.log("No Profile found. ");
            window.location.href = "/#profile";
         } else {
            console.log("Auth failed: " + error);
         }

      });

   },


   sendZi: function () {
      var $btnSend = $("#btnSend");

      $btnSend.attr("disabled", "disabled");
      $btnSend.html("Sending...");

      //Get Grat
      var cbGrat = JSON.parse(localStorage.getItem("cbGrat"));

      if (localStorage.getItem('authenticated')) {
         //Send to Dropbox

         //Store Grat
         gratzi.Store.addGrat(cbGrat, function (gPath) {

            var profile = JSON.parse(localStorage.getItem("profile"));
            var newZi = {
               "version": "0.1",
               "type": "zi",
               "recipient": cbGrat.sender,
               "sender": { "type": "gratzi", "fullname": $('#zName').html(), "email": profile.email, "bio": profile.bio, "image": $("#zImage").attr("src") },
               "grat": utils.b64_to_utf8(localStorage.getItem("loc")),
               "message": $('#response').val().split(')').join("&#41;"),  //replace all occurences of )
               "tags": $('#tags').val().split(')').join("&#41;")  //replace all occurences of )
            };

            if (localStorage.getItem("loc")) {
               localStorage.removeItem("loc");
            }

            //Create Zi
            gratzi.Store.addZi(newZi, function (zPath) {

               //Get link to new Zi
               gratzi.Store.getLink(zPath, function (url) {

                  var ziLink = "<a href='" + gratzi.Client.url + "/#reply?loc=" + utils.utf8_to_b64(url) + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a>";

                  var email = {
                     "to": newZi.recipient.email,
                     "from": newZi.sender.email,
                     "subject": profile.fullname + " accepted your gratitude!",
                     "message": "You and " + profile.fullname + " completed a GratZi!<br/><br/>" +
                        "<table><tr><td align='center' width='300' bgcolor='#08c' style='background: #08c; padding-top: 6px; padding-right: 10px; padding-bottom: 6px; padding-left: 10px; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #fff; font-weight: bold; text-decoration: none; font-family: Helvetica, Arial, sans-serif; display: block;'>" +
                        ziLink + "</td></tr></table>"

                  };

                  //Email Zi to recipient
                  $.post(gratzi.Server.url + "/email", email,
                     function (data) {
                        if (data.token === "Success") {
                           $btnSend.removeAttr("disabled");
                           $btnSend.html("Send");
                           $('#info').show().html("Zi sent!");
                           $('#zMessage').html($('#response').val());
                           $('#zTags').html($('#tags').val());

                           $('#sendForm').hide();
                           $("#btnPickImg").hide();

                           //window.location.href = "/#view?zi=" + url;
                           //gratzi.Store.loadGratzi(function () {
                           //window.location.href = "/#view";
                           //});
                        }
                     }, "json").fail(function (error) {
                        $('#fail').show().html("Failed to email.");
                        $btnSend.removeAttr("disabled");
                        $btnSend.html("Send");
                        console.log(error);
                     });


               });

            });


         });

      } else {
         //Send to AWS S3
         var sender, newZi;

         if (cbGrat.recipient.type == "email") {
            sender = { "type": "gratzi", "fullname": $('#zName').html(), "email": cbGrat.recipient.email }
         } else {
            sender = { "type": "gratzi", "fullname": $("#zName").html(), "id": cbGrat.recipient.id, "image": $("#zImage").attr("src") };
         }

         newZi = JSON.stringify({
            "version": "0.1",
            "type": "zi",
            "recipient": cbGrat.sender,
            "sender": sender,
            "grat": utils.b64_to_utf8(localStorage.getItem("loc")),
            "message": $('#response').val().split(')').join("&#41;"),  //replace all occurences of )
            /*"tags": $('#tags').val().split(')').join("&#41;")  //replace all occurences of )
             */
         });


         $.ajax({
            url: gratzi.Server.url + "/getS3Creds/zi.json",
            dataType: "JSON",
            success: function(res){
               var fd = new FormData();
               fd.append("key", "zis/zi_" + utils.getHash(newZi) );
               fd.append("AWSAccessKeyId", res.s3Key);
               fd.append("acl", "public-read");
               //fd.append("success_action_redirect", gratzi.Client.url + "/#reply");
               fd.append("policy", res.s3PolicyBase64);
               fd.append("signature", res.s3Signature);
               fd.append("Content-Type", res.s3Mime);

               fd.append("file", newZi);

               var xhr = new XMLHttpRequest();

               xhr.open("POST", "https://gratzi.s3.amazonaws.com/");
               xhr.onload = function () {
                  //var url = JSON.parse(xhr.responseText);
                  $('#zMessage').html(xhr.responseText);
                  console.log(xhr.responseText);
               }
               xhr.send(fd);
            },
            error: function (res, status, error) {
               console.log(error);
               //do some error handling here
            }
          });

      }


   },


   saveZi: function () {

      var $btnSave = $("#btnSave");

      $btnSave.attr("disabled", "disabled");
      $btnSave.html("Saving...");

      var cbZi = JSON.parse(localStorage.getItem("cbZi"));

      if (localStorage.getItem('authenticated')) {

         //Store Grat
         gratzi.Store.addZi(cbZi, function (path) {
            console.log("Zi stored: " + path);
            $('#saveForm').hide();
            $('#info').show().html("Zi Saved!");
            //gratzi.Store.loadGratzi(function () {
            //  window.location.href = "/#view";
            //});
         });

      } else {
         //Redirect to login
         window.location.href = "/#profile";
      }

   },

   pickImage: function () {

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


      gratzi.Store.addImage(file, file.name, function (path) {
         $('#zImage').attr("src", path);
         $btnPick.removeAttr("disabled");
         $btnPick.html("Change Image");
         console.log("Image Uploaded: " + path);
      });
   },

   uploadToImgur: function () {



      //ADD IMAGE
      //http://hacks.mozilla.org/2011/03/the-shortest-image-uploader-ever/
      var files = $('input[id = upImage]')[0].files;
      var file = files[0];
      if (!file || !file.type.match(/image.*/)) return;

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
      }
      xhr.send(fd);

   }


})
;
