

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



/*    <p>
Choose where your profile and Gratzi's will be saved:
</p>-->
<!--    <p>
<a class="btn-auth btn-github large" href="<%= gitAuthUrl %>"><b>GitHub</b>
</a>
</p>*/