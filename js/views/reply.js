
//*********************JSONP CALLBACKS***********************//

function gratCallback(json) {

  $('#gName').append(json.sender.fullname);
  $('#gMessage').append(json.message);
  $('#gTags').append(json.tags);
  $('#gImage').attr("src", json.sender.image);
  localStorage.setItem("cbGrat", JSON.stringify(json));
  $('#auth').hide();
  $('#saveForm').css('display', 'none');

  //Profile details:
  var prof = JSON.parse(localStorage.getItem("profile"));
  $('#zName').append(prof.fullname);
  $('#zImage').attr("src", prof.image);
}

function ziCallback(json) {

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




//*********************  REPLY   ***************************//
gratzi.ReplyView = Backbone.View.extend({

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

    var cbScript, url;

    if (this.options && this.options.grat) {
      url = utils.b64_to_utf8(this.options.grat);

      //JSONP Callback
      cbScript = "<script type='text/javascript' src='" + url + "'></script>";
      localStorage.setItem("gratLink", url);

    }
    else if (this.options && this.options.zi) {
      url = utils.b64_to_utf8(this.options.zi);

      //JSONP Callback
      cbScript = "<script type='text/javascript' src='" + url + "'></script>";
      localStorage.setItem("ziLink", url);

    }

    $(this.el).html(this.template({ script: cbScript }));
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

            var ziLink = "<a href='" + gratzi.Client.url + "/#view?zi=" + utils.utf8_to_b64(url) + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a>";

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
