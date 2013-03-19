
//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {
  $('#gTo').append(json.to);
  $('#gFrom').append(json.from.fullname);
  $('#gMessage').append(json.message);
  $('#gTags').append(json.tags);
  $('#gImage').attr("src", json.from.image);
  localStorage.setItem("cbGrat", JSON.stringify(json));
  $('#auth').hide();
  $('#saveForm').css('display', 'none');
}

function ziCallback(json) {
  $('#zTo').append(json.to.fullname);
  $('#zFrom').append(json.from.fullname);
  $('#zMessage').append(json.message);
  $('#zTags').append(json.tags);
  $('#zImage').attr("src", json.from.image);
  localStorage.setItem("cbZi", JSON.stringify(json));

  if (localStorage.getItem('authenticated')) {
    var gLink = json.grat;
    var index = gLink.lastIndexOf("/");
    var gFileName = gLink.substr(index + 1);
    $('#sendForm').hide();
    $('#auth').hide();
    $('#grat').show();

    gratzi.Store.getFile(gFileName, function (file) {
      $('#gTo').append(file.to);
      $('#gFrom').append(file.from.fullname);
      $('#gMessage').append(file.message);
      $('#gTags').append(file.tags);
      $('#gImage').attr("src", file.from.image);
    });

  }
  else {
    $('#grat').hide();
    $('#auth').show();
  }


}



//*********************   HEADER    ***************************//
gratzi.HeaderView = Backbone.View.extend({

  events: {
    //"click a": 'selectNavItem',
    "click #logout": "logout"
  },

  initialize: function () {
    console.log('Initializing Header View');

    this.render();
  },

  render: function () {
    $(this.el).html(this.template({ profile: JSON.parse(localStorage.getItem("profile")) }));
    return this;
  },

  // selectNavItem: function (source) {
  //   this.render();
  //   $(source.target.getAttribute('href')).addClass("active");
  // },

  logout: function () {
    gratzi.Store.logout();
    this.render();
    window.location.href = "/#";
  }

});







//*********************   HOME   ***************************//

gratzi.HomeView = Backbone.View.extend({

  initialize: function () {
    console.log('Initializing Home View');
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  }

});







//*********************   ABOUT    ***************************//

gratzi.AboutView = Backbone.View.extend({

  initialize: function () {
    console.log('Initializing About View');
    this.model = gratzi.Client;
  },

  render: function () {
    $(this.el).html(this.template(this.model));
    return this;
  }

});





//************************   SEND   *************************//

gratzi.SendView = Backbone.View.extend({

  events: {
    'click #sendBtn': 'sendGrat'
    //'click #pickContact': 'pickContact'
    //'keyup .contact-key': 'findContact'
  },

  initialize: function () {
    console.log('Initializing Send View');
    this.render();
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  },

  sendGrat: function (e) {

    $("#sendBtn").attr("disabled", "disabled");
    $("#sendBtn").html("Sending...");

    var profile = JSON.parse(localStorage.getItem("profile"));

    //Create Grat

    var newGrat = {
      //"url": profile.url, 
      "from": { "fullname": profile.fullname, "email": profile.email, "bio": profile.bio, "image": profile.image },
      "to": $('#to').val(),
      "message": $('#message').val(),
      "tags": $('#tags').val()
    }

    //Add Grat
    gratzi.Store.addGrat(newGrat, function (path) {

      //Get link to new Grat
      gratzi.Store.getLink(path, function (url) {

        var gratLink = gratzi.Client.url + "/#view?grat=" + url;

        var email = {
          "to": newGrat.to,
          "from": newGrat.from.email,
          "subject": newGrat.from.fullname + " has sent you a Gratzi!",
          "message": "You recieved a Gratzi! Click this link to view it: <br/><br/>" + gratLink
        }

        //Email recipient
        $.post(gratzi.Server.url + "/email", email,
          function (data) {
            if (data.token == "Success") {
              $('#info').show().html("Gratzi sent!");
              $('#to').val('');
              $('#message').val('');
              $('#tags').val('');
              $("#sendBtn").removeAttr("disabled");
              $("#sendBtn").html("Send");
            }
            else {
              $("#sendBtn").removeAttr("disabled");
              $("#sendBtn").html("Send");
              $('#fail').show().html("Failed to send.");
            }

          }, "json");



      });

    });

  }


});





//*********************  VIEW   ***************************//


gratzi.ViewView = Backbone.View.extend({

  events: {
    "click #sendBtn": "sendZi",
    "click #save": "saveZi",
    "click #reload": "reload"

  },

  initialize: function () {
    console.log('Initializing View View');
    //alert(this.options.gLink);
    this.render();
  },

  render: function () {

    var cbScript;

    if (this.options && this.options.grat) {
      //DOESN'T WORK because Dropbox doesn't do CORS on this type of requests (only via REST API)
      //$.ajax({
      //  url: this.options.grat,
      //  type: 'GET',
      //  success: function (res) {
      //    alert(res);
      //  }
      //});

      //Have to use the security hole that is JSONP
      cbScript = "<script type='text/javascript' src='" + this.options.grat + "'></script>";
      localStorage.setItem("gratLink", this.options.grat);

    }
    else if (this.options && this.options.zi) {
      //Have to use the security hole that is JSONP
      cbScript = "<script type='text/javascript' src='" + this.options.zi + "'></script>";
      localStorage.setItem("ziLink", this.options.zi);

    }
    else {

      var grats = JSON.parse(localStorage.getItem("grats"));
      var zis = JSON.parse(localStorage.getItem("zis"));

      var gratzi = [];

      for (zi in zis) {
        
        var zi = JSON.parse(zis[zi]);

        var index = zi.grat.lastIndexOf("/");
        var gName = zi.grat.substr(index + 1);

        for (grat in grats) {

          if (grat == gName)
            gratzi[gratzi.length] = { "grat": JSON.parse(grats[grat]), "zi": zi };
        }

      }

      //for (gz in gratzi) {


      //  var t = gratzi[gz];
      //  var grat = gratzi[gz].grat;
      //  var zi = JSON.parse(gratzi[gz][zi]);

      //}

    }

    $(this.el).html(this.template({ script: cbScript, gratzis: gratzi }));
    return this;
  },

  sendZi: function () {


    $("#sendBtn").attr("disabled", "disabled");
    $("#sendBtn").html("Sending...");


    //Get Grat
    var cbGrat = JSON.parse(localStorage.getItem("cbGrat"));

    if (localStorage.getItem('authenticated')) {

      //Store Grat
      gratzi.Store.addGrat(cbGrat, function (path) {

        var profile = JSON.parse(localStorage.getItem("profile"));
        var newZi = {
          "to": cbGrat.from,
          //"url": profile.url, 
          "from": { "fullname": profile.fullname, "email": profile.email, "bio": profile.bio, "image": profile.image },
          "grat": localStorage.getItem("gratLink"),
          "message": $('#response').val()
          //"tags": $('#tags').val()
        }

        //Create Zi
        gratzi.Store.addZi(newZi, function (path) {

          //Get link to new Zi
          gratzi.Store.getLink(path, function (url) {

            var ziLink = gratzi.Client.url + "/#view?zi=" + url;

            var email = {
              "to": newZi.to.email,
              "from": newZi.from.email,
              "subject": profile.fullname + " has completed your Gratzi!",
              "message": "You recieved a Zi! Click this link to view it: <br/><br/>" + ziLink
            }

            //Email Zi to recipient
            $.post(gratzi.Server.url + "/email", email,
              function (data) {
                if (data.token == "Success") {
                  $("#sendBtn").removeAttr("disabled");
                  $("#sendBtn").html("Send");
                  $('#info').show().html("Zi sent!");
                }
              }, "json");

            $('#response').val('');

          });

        });

      });
    }
    else {
      //Redirect to login
      window.location.href = "/#profile";
    }

  },

  saveZi: function () {

    $("#save").attr("disabled", "disabled");
    $("#save").html("Saving...");

    var cbZi = JSON.parse(localStorage.getItem("cbZi"));

    if (localStorage.getItem('authenticated')) {

      //Store Grat
      gratzi.Store.addZi(cbZi, function (path) {
        console.log("Zi stored: " + path);
        $("#save").removeAttr("disabled");
        $("#save").html("Save");
        $('#info').show().html("Zi Saved!");
      });

    } else {
      //Redirect to login
      window.location.href = "/#profile";
    }

  },

  reload: function () {

    gratzi.Store.getFiles("grat", function () {
      window.location.reload();
      //$("grats").append(grats);
    });
  }


});





//************************    PROFILE    *************************//

gratzi.ProfileView = Backbone.View.extend({

  events: {
    "click #logout": "logout",
    "click #dropbox": "authDropBox",
    "click #save": "saveProfile",
    "change input": "pickFile"
  },

  initialize: function () {
    console.log('Initializing ProfileView');
    this.render();
  },

  render: function () {

    var gitAuthUrl, username, ui, avatar, store, fullname, bio, profile, profCallback;

    if (this.options && this.options.grat) {
      //Load profile from Grat
      var grat = JSON.parse(JSON.parse(localStorage.getItem("grats"))[this.options.grat]);
      var profile = {
        "email": grat.from.email,
        "fullname": grat.from.fullname,
        "bio": grat.from.bio,
        "image": grat.from.image
      }

    }
    else if (localStorage.getItem('authenticated')) {
      //Load logged in user profile
      var profile = localStorage.getItem('profile');
      if (profile) {
        profile = JSON.parse(profile);

        //var image = localStorage.getItem('imagePath');
        //if (image)
        //  profile.image = image;

      }


    }
    else {
      //Not logged in
      gitAuthUrl = git.getAuthUrl(gratzi.Client.gitClientId);
    }



    $(this.el).html(this.template({ gitAuthUrl: gitAuthUrl, profile: profile }));

    return this;

  },

  authDropBox: function () {

    store = drop;

    store.auth(function (error, profile) {
      if (profile) {
        var jProf = JSON.stringify(profile);
        console.log("Auth returned: " + jProf);
        localStorage.setItem("profile", jProf);
        window.location.href = "/#send";
      }
      else {
        console.log("Auth failed: " + profile);
      }

    });

  },

  pickFile: function (e) {
    $('#pretty-input').val($('input[id = file]').val().replace("C:\\fakepath\\", ""));
  },

  saveProfile: function () {

    $("#save").attr("disabled", "disabled");
    $("#save").attr("value", "Saving...");



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
      "email": localStorage.getItem("username"),
      "fullname": $('#fullname').val(),
      "bio": $('#bio').val(),
      "image": fileName,
      "ui": gratzi.Client.url
    }


    gratzi.Store.saveMyProfile(newProfile, function (path) {
      console.log("Profile Saved: " + path);
      $("#save").removeAttr("disabled");
      $("#save").attr("value", "Save");
      $('#info').show().html("Profile saved!");
      newProfile.url = path;
      localStorage.setItem('profile', JSON.stringify(newProfile));

      gratzi.Store.load(function () {
        window.location.reload();
      });


      //this.render();
    });
    //}



  },

  logout: function () {
    gratzi.Store.logout();
    window.location.href = "/#";
  }

});

