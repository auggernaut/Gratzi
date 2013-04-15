
//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {
  //$('#gTo').append(json.to);
  $('#gName').append(json.sender.fullname);
  $('#gMessage').append(json.message);
  $('#gTags').append(json.tags);
  $('#gImage').attr("src", json.sender.image);
  localStorage.setItem("cbGrat", JSON.stringify(json));
  $('#auth').hide();
  $('#saveForm').css('display', 'none');
}

function ziCallback(json) {
  //$('#zTo').append(json.to.fullname);
  $('#zName').append(json.sender.fullname);
  $('#zMessage').append(json.message);
  $('#zTags').append(json.tags);
  $('#zImage').attr("src", json.sender.image);
  localStorage.setItem("cbZi", JSON.stringify(json));

  if (localStorage.getItem('authenticated')) {
    var gLink = json.grat;
    var index = gLink.lastIndexOf("/");
    var gFileName = gLink.substr(index + 1);
    $('#sendForm').hide();
    $('#auth').hide();
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
    $('#auth').show();
  }


}



//*********************   HEADER    ***************************//
gratzi.HeaderView = Backbone.View.extend({

  events: {
    //"click a": 'selectNavItem',
  },

  initialize: function () {
    console.log('Initializing Header View');

    this.render();
  },

  render: function () {
    $(this.el).html(this.template({ profile: JSON.parse(localStorage.getItem("profile")) }));
    return this;
  }

});



//*********************   FOOTER    ***************************//

gratzi.FooterView = Backbone.View.extend({

  events: {
    "click #logout": "logout"
  },

  initialize: function () {
    console.log('Initializing Footer View');
    this.model = gratzi.Client;
    this.render();
  },

  render: function () {
    $(this.el).html(this.template(this.model));
    return this;
  },

  logout: function () {
    gratzi.Store.logout();
    this.render();
    window.location.href = "/#";
    window.location.reload();
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






//************************   CREATE   *************************//

gratzi.CreateView = Backbone.View.extend({

  events: {
    'click #createBtn': 'createGrat'
    //'click #pickContact': 'pickContact'
    //'keyup .contact-key': 'findContact'
  },

  initialize: function () {
    console.log('Initializing Create View');
    this.render();
  },

  render: function () {
    $(this.el).html(this.template({ profile: JSON.parse(localStorage.getItem("profile")) }));
    return this;
  },

  createGrat: function (e) {

    $("#createBtn").attr("disabled", "disabled");
    $("#createBtn").html("Creating...");

    var profile = JSON.parse(localStorage.getItem("profile"));

    //Create Grat

    var newGrat = {
      "type": "grat",
      "sender": { "fullname": profile.fullname, "email": profile.email, "bio": profile.bio, "image": profile.image },
      "recipient": $('#to').val(),
      "message": $('#message').val(),
      "tags": $('#tags').val()
    };

    //gratzi.Store.addBlob(newGrat, function(result){
    //  console.log("addBlob returned: " + result);
    //});

    //Add Grat
    gratzi.Store.addGrat(newGrat, function (path) {

      //Get link to new Grat
      gratzi.Store.getLink(path, function (url) {

        var gratLink = gratzi.Client.url + "/#view?grat=" + url;

        var email = {
          "to": newGrat.recipient,
          "from": newGrat.sender.email,
          "subject": newGrat.sender.fullname + " has sent you a Gratzi!",
          "message": "You recieved a Gratzi!<br/><br/>" +
                      "<table><tr><td align='center' width='300' bgcolor='#08c' style='background: #08c; padding-top: 6px; padding-right: 10px; padding-bottom: 6px; padding-left: 10px; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #fff; font-weight: bold; text-decoration: none; font-family: Helvetica, Arial, sans-serif; display: block;'>" +
                      "<a href='" + gratLink + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a></td></tr></table>"
        };

        $("#createBtn").html("Emailing...");
        //Email recipient
        $.post(gratzi.Server.url + "/email", email,
          function (data) {
            if (data.token == "Success") {
              $('#info').show().html("Gratzi sent!");
              $('#to').val('');
              $('#message').val('');
              $('#tags').val('');
              gratzi.Store.loadGratzi(function () {
                window.location.href = "/#view";
              });
            }
            else {
              $('#fail').show().html("Failed to email.");
            }

            $("#createBtn").removeAttr("disabled");
            $("#createBtn").html("Create");

          }, "json");



      });

    });

  }


});





//*********************  GRATZI   ***************************//
gratzi.GratziView = Backbone.View.extend({

  events: {
    "click #sendBtn": "sendZi",
    "click #saveBtn": "saveZi",
    "click .comment_tr": "comment"
  },

  initialize: function () {
    console.log('Initializing Gratzi View');
    this.render();

  },

  render: function () {

    var cbScript;

    if (this.options && this.options.grat) {
      //JSONP Callback
      cbScript = "<script type='text/javascript' src='" + this.options.grat + "'></script>";
      localStorage.setItem("gratLink", this.options.grat);

    }
    else if (this.options && this.options.zi) {
      //JSONP Callback
      cbScript = "<script type='text/javascript' src='" + this.options.zi + "'></script>";
      localStorage.setItem("ziLink", this.options.zi);

    }


    $(this.el).html(this.template({ script: cbScript, profile: JSON.parse(localStorage.getItem("profile")) }));
    return this;

  },


  sendZi: function () {


    $("#sendBtn").attr("disabled", "disabled");
    $("#sendBtn").html("Sending...");


    //Get Grat
    var cbGrat = JSON.parse(localStorage.getItem("cbGrat"));

    if (localStorage.getItem('authenticated')) {

      //Store Grat
      gratzi.Store.addGrat(cbGrat, function (gPath) {

        var profile = JSON.parse(localStorage.getItem("profile"));
        var newZi = {
          "type": "zi",
          "recipient": cbGrat.sender,
          //"url": profile.url, 
          "sender": { "fullname": profile.fullname, "email": profile.email, "bio": profile.bio, "image": profile.image },
          "grat": localStorage.getItem("gratLink"),
          "message": $('#response').val()
          //"tags": $('#tags').val()
        };

        //Create Zi
        gratzi.Store.addZi(newZi, function (zPath) {

          //Get link to new Zi
          gratzi.Store.getLink(zPath, function (url) {

            var ziLink = "<a href='" + gratzi.Client.url + "/#view?zi=" + url + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a>";

            var email = {
              "to": newZi.recipient.email,
              "from": newZi.sender.email,
              "subject": profile.fullname + " has completed your Gratzi!",
              "message": "You recieved a Zi!<br/><br/>" +
                          "<table><tr><td align='center' width='300' bgcolor='#08c' style='background: #08c; padding-top: 6px; padding-right: 10px; padding-bottom: 6px; padding-left: 10px; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #fff; font-weight: bold; text-decoration: none; font-family: Helvetica, Arial, sans-serif; display: block;'>" +
                          ziLink + "</td></tr></table>"

            };

            //Email Zi to recipient
            $.post(gratzi.Server.url + "/email", email,
              function (data) {
                if (data.token == "Success") {
                  $("#sendBtn").removeAttr("disabled");
                  $("#sendBtn").html("Send");
                  $('#info').show().html("Zi sent!");

                  //window.location.href = "/#view?zi=" + url;
                  gratzi.Store.loadGratzi(function () {
                    window.location.href = "/#view";
                  });
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

    $("#saveBtn").attr("disabled", "disabled");
    $("#saveBtn").html("Saving...");

    var cbZi = JSON.parse(localStorage.getItem("cbZi"));

    if (localStorage.getItem('authenticated')) {

      //Store Grat
      gratzi.Store.addZi(cbZi, function (path) {
        console.log("Zi stored: " + path);
        $("#saveBtn").removeAttr("disabled");
        $("#saveBtn").html("Save");
        $('#info').show().html("Zi Saved!");
        gratzi.Store.loadGratzi(function () {
          window.location.href = "/#view";
        });
      });

    } else {
      //Redirect to login
      window.location.href = "/#profile";
    }

  },


  comment: function () {
    $(this).toggleClass('disabled');
    $(this).parent().parent().parent().find('form').slideToggle(250, function () {
      $('.main_container').masonry();
    });
  }


});


//************************  LIST *********************************//
gratzi.ListView = Backbone.View.extend({

  events: {
    "click #reload": "reload",
    "change #tags": "tagSelect"
  },

  initialize: function () {
    console.log('Initializing List View');

    this.render();

  },

  render: function (pickTag) {

    var zis = JSON.parse(localStorage.getItem("zis"));
    var grats = JSON.parse(localStorage.getItem("grats"));
    var tags = [];

    //Render tags in ListView
    for (var grat in grats) {
      var filter = false;
      var tag;
      var ts = JSON.parse(grats[grat]).tags.split(",");

      for (var t in ts) {
        tag = ts[t].trim();
        tags[tag] = tag;
        if (pickTag == tag)
          filter = true;
      }

      $(this.el).html(this.template({ tags: tags }));
    }

    //Render all gratzi in ListItemViews
    for (var grat in grats) {
      var gJSON = JSON.parse(grats[grat]);

      if (!pickTag || filter) {
        var match = false;

        for (var zi in zis) {
          var ziJSON = JSON.parse(zis[zi]);
          var gId = ziJSON.grat.substr(ziJSON.grat.lastIndexOf("/") + 1);

          if (grat == gId) {
            match = true;
            $(this.el).append(new gratzi.ListItemView({ model: { gratid: gId, "grat": gJSON, "zi": ziJSON } }).render().el);
          }
        }

        if (!match) {
          $(this.el).append(new gratzi.ListItemView({ model: { gratid: gId, "grat": gJSON, "zi": { "from": {}, to: {}, message: "" } } }).render().el);
        }
      }
    }

    

  },

  tagSelect: function (e) {
    this.render($(e.currentTarget).val());
  },

  reload: function () {
    gratzi.Store.loadGratzi(function () {
      window.location.reload();
    });

  }

});



//************************   LIST ITEM   *************************//

gratzi.ListItemView = Backbone.View.extend({


  render: function () {
    $(this.el).html(this.template(this.model));
    return this;
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

    var gitAuthUrl, username, ui, avatar, store, fullname, bio, profCallback;
    var profile = {
      "email": "",
      "fullname": "",
      "bio": "",
      "image": ""
    };

    if (this.options && this.options.grat) {
      //Load profile from Grat
      var grat = JSON.parse(JSON.parse(localStorage.getItem("grats"))[this.options.grat]);

      profile.email = grat.sender.email;
      profile.fullname = grat.sender.fullname;
      profile.bio = grat.sender.bio;
      profile.image = grat.sender.image;

    }
    else if (localStorage.getItem('authenticated')) {

      //Load logged in user profile
      if (localStorage.getItem('profile')) {
        profile = JSON.parse(localStorage.getItem('profile'));

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
        window.location.href = "/#create";
      }
      else if (error == "404") {
        console.log("No Profile found. ");
        //window.location.href = "/#profile";
      } else {
        console.log("Auth failed: " + error);
      }

    });

  },

  pickFile: function (e) {
    $('#pretty-input').val($('input[id = file]').val().replace("C:\\fakepath\\", ""));
  },

  saveProfile: function () {

    $("#save").attr("disabled", "disabled");
    $("#save").html("Saving...");



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
      $("#save").html("Save");
      $('#info').show().html("Profile saved!");


      gratzi.Store.loadUser(function (error, profile) {
        profile.url = path;

        var jProf = JSON.stringify(profile);
        localStorage.setItem("profile", jProf);
        window.location.href = "/#create";
      });

    });


  },

  logout: function () {
    gratzi.Store.logout();
    window.location.href = "/#";
  }

});

