
//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {
  $('#to').append(json.to);
  $('#from').append(json.from.fullname);
  $('#message').append(json.message);
  $('#tags').append(json.tags);

  localStorage.setItem("cbGrat", JSON.stringify(json));
}

function ziCallback(json) {
  $('#to').append(json.to);
  $('#from').append(json.from);
  $('#message').append(json.message);
  $('#tags').append(json.tags);
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
    'click #save': 'submit'
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

  submit: function (e) {

    $("#save").attr("disabled", "disabled");
    $("#save").html("Sending...");

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
              $("#save").removeAttr("disabled");
              $("#save").html("Save");
            }
            else {
              $("#save").removeAttr("disabled");
              $("#save").html("Save");
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
    "click #accept": "accept",
    "click #reload": "reload"

  },

  initialize: function () {
    console.log('Initializing View View');
    //alert(this.options.gLink);
    this.render();
  },

  render: function () {

    var gratCallback, profCallback;

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
      gratCallback = "<script type='text/javascript' src='" + this.options.grat + "'></script>";
      localStorage.setItem("gratLink", this.options.grat);

    }
    else {

      var grats = JSON.parse(localStorage.getItem("grats"));
    }

    $(this.el).html(this.template({ script: gratCallback, grats: grats }));
    return this;
  },

  accept: function () {


    //if (!localStorage.getItem('authenticated')){


    //Recreate Grat
    var cbGrat = JSON.parse(localStorage.getItem("cbGrat"));

    //var newGrat = {
    //  "from": $('#fromUrl').val(),
    //  "to": $('#to').val(),
    //  "message": $('#message').val(),
    //  "tags": $('#tags').val()
    //}

    if (localStorage.getItem('authenticated')) {

      //Store Grat
      gratzi.Store.addGrat(cbGrat, function (path) {

        var profile = JSON.parse(localStorage.getItem("profile"));
        var newZi = {
          "to": cbGrat.from,
          //"url": profile.url, 
          "from": { "fullname": profile.fullname, "email": profile.email, "image": profile.image },
          "grat": localStorage.getItem("gratLink"),
          "message": $('#response').val(),
          "tags": $('#tags').val()
        }

        //Create Zi
        gratzi.Store.addZi(newZi, function (path) {

          //Get link to new Zi
          gratzi.Store.getLink(path, function (url) {

            var ziLink = gratzi.Client.url + "/#view?zi=" + url;

            var email = {
              "to": newZi.to.email,
              "from": newZi.from.email,
              "subject": profile.fullname + " has sent you a Gratzi!",
              "message": "You recieved a Gratzi! Click this link to view it: <br/><br/>" + ziLink
            }

            //Email Zi to recipient
            $.post(gratzi.Server.url + "/email", email,
              function (data) {
                if (data.token == "Success") {
                  $('#info').show().html("Gratzi sent!");
                }
              }, "json");

            $('#to').val('');
            $('#message').val('');
            $('#tags').val('');

          });

        });

      });
    }
    else {
      //Redirect to login

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
    "click #save": "save",
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

  save: function () {

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

