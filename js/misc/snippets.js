//localStorage.setItem("username", userInfo.email);
//localStorage.setItem("userId", userInfo.uid);

//GET PROFILE FILE
//If more than one, get most recent
dropbox.findByName("/", "profile", function (error, files) {

   if (files.length > 0) {
      var mostRecent = files[0];

      for (var i = 0; i < files.length - 1; i++) {
         if ((files[i].modifiedAt - files[i + 1].modifiedAt) < 0)
            mostRecent = files[i + 1];
      }
      dropbox.readFile(mostRecent.path, function (error, stat) {
         $.cookie("profile", stat);
         callback(stat);
      });
   }
});


dropbox.getUserInfo(function (error, userInfo) {
   if (error) {
      return showError(error);  // Something went wrong.
   }

   alert("Hello, " + userInfo.name + "!");
});

dropbox.writeFile("hello_world.txt", "Hello, world!\n", function (error, stat) {
   if (error) {
      return showError(error);  // Something went wrong.
   }

   alert("File saved as revision " + stat.revisionTag);
});

dropbox.readFile("hello_world.txt", function (error, data) {
   if (error) {
      return showError(error);  // Something went wrong.
   }

   alert(data);  // data has the file's contents
});

dropbox.readdir("/", function (error, entries) {
   if (error) {
      return showError(error);  // Something went wrong.
   }

   alert("Your Dropbox contains " + entries.join(", "));
});


gitMatch = window.location.href.match(/\?code=([a-z0-9]*)/);

if (gitMatch) {
   console.log("Getting GitHub access token...");
   $('#content').append("<div class='center'><h1>Loading</h1><img src='/css/images/loading.gif' /></div>");
   git.authenticate(gitMatch[1], function (err) {
      if (err)
         console.log("Error authenticating with GitHub:" + err);
      else {
         console.log("Gettings GitHub account details...");
         git.load(function (result, data) {
            Backbone.history.navigate("#create");
         });
      }
   });
}

//from profile.js
if (this.options && this.options.grat) {
   //Load profile from Grat
   var grat = JSON.parse(JSON.parse(localStorage.getItem("grats"))[this.options.grat]);

   profile.email = grat.sender.email;
   profile.fullname = grat.sender.fullname;
   profile.bio = grat.sender.bio;
   profile.image = grat.sender.image;

}


//Save Grat
Gratzi.Store.saveFile(cbGrat, function (gPath) {

   var profile = JSON.parse(localStorage.getItem("profile"));
   var newZi = {
      "version": "0.1",
      "type": "zi",
      "recipient": cbGrat.sender,
      "sender": { "type": "Gratzi", "fullname": $('#zName').html(), "email": profile.email, "bio": profile.bio, "image": $("#zImage").attr("src") },
      "grat": utils.b64_to_utf8(localStorage.getItem("loc")),
      "message": $('#response').val().split(')').join("&#41;"),  //replace all occurences of )
      "tags": $('#tags').val().split(')').join("&#41;")  //replace all occurences of )
   };

   if (localStorage.getItem("loc")) {
      localStorage.removeItem("loc");
   }

   //Save Zi
   Gratzi.Store.saveFile(newZi, function (zPath) {

      //Get link to new Zi
      Gratzi.Store.getLink(zPath, function (url) {

         var ziLink = "<a href='" + Gratzi.Servers.fileserver + "/#reply?loc=" + utils.utf8_to_b64(url) + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a>";

         var email = {
            "to": newZi.recipient.email,
            "from": newZi.sender.email,
            "subject": profile.fullname + " accepted your gratitude!",
            "message": "You and " + profile.fullname + " completed a GratZi!<br/><br/>" +
               "<table><tr><td align='center' width='300' bgcolor='#08c' style='background: #08c; padding-top: 6px; padding-right: 10px; padding-bottom: 6px; padding-left: 10px; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #fff; font-weight: bold; text-decoration: none; font-family: Helvetica, Arial, sans-serif; display: block;'>" +
               ziLink + "</td></tr></table>"

         };

         //Email Zi to recipient
         $.post(Gratzi.Servers.url + "/email", email,
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
                  //Gratzi.Store.loadGratzi(function () {
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

   //SAVE NEW PROFILE
   var newProfile = {
      "userid": localStorage.getItem("userId"),
      "email": localStorage.getItem("email"),
      "fullname": $('#fullname').val(),
      "bio": $('#bio').val(),
      "image": fileName,
      "ui": Gratzi.Client.url
   };



});



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

         Gratzi.Store.addImage(e.target.result, theFile.name, function (path) {
            console.log("Image Uploaded: " + path);
         });

      };
   })(f);

   reader.readAsArrayBuffer(f);
}

   /*    <p>
    Choose where your profile and Gratzi's will be saved:
    </p>-->
    <!--    <p>
    <a class="btn-auth btn-github large" href="<%= gitAuthUrl %>"><b>GitHub</b>
    </a>
    </p>*/

