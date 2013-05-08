//************************   CREATE   *************************//

gratzi.CreateView = Backbone.View.extend({

   events: {
      'click #createBtn': 'createGrat',
      'click #pickfbContact': 'pickfbContact',
      'click #btnPickImg': 'pickImage'
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
      var $createBtn = $("#createBtn");

      $createBtn.attr("disabled", "disabled");
      $createBtn.html("Creating...");

      var profile = JSON.parse(localStorage.getItem("profile"));
      var fId = $('#fbFriendId').val(), recipient, sender;

      if (fId){
         recipient = { "type": "facebook", "fullname": $("#zName").html(), "id": fId, "image": $("#zImage").attr("src") };
      } else {
         recipient = { "type": "email", "email": $('#to').val() };
      }

      sender = { "type": gratzi.Store.storeType, "fullname": profile.fullname, "email": profile.email, "bio": profile.bio, "image": $("#gImage").attr("src") };

      //Create Grat
      var newGrat = {
         "version": "0.1",
         "type": "grat",
         "sender": sender,
         "recipient": recipient,
         "message": $('#message').val().split(')').join("&#41;"),  //replace all occurences of )
         "tags": $('#tags').val().split(')').join("&#41;")  //replace all occurences of )
      };


      //Add Grat
      gratzi.Store.addGrat(newGrat, function (path) {

         //Get link to new Grat
         gratzi.Store.getLink(path, function (url) {

            var gratLink = gratzi.Client.url + "/#reply?loc=" + utils.utf8_to_b64(url);

            if (fId) {
               //Facebook message recipient
               FB.ui({
                     method: 'send',
                     name: 'Receive the gratitude!',
                     link: gratLink,
                     to: fId
                  },
                  function (response) {
                     $('#info').show().html("Gratzi sent!");
                     $('#zName').html('');
                     $('#message').val('');
                     $('#tags').val('');

                     $createBtn.removeAttr("disabled");
                     $createBtn.html("Create");
                     $("#zImage").attr("src", "../img/blank-user.jpg");

                     //gratzi.Store.loadGratzi(function () {
                     //  window.location.href = "/#view";
                     //});
                  });
            }
            else {
               //Email recipient
               var email = {
                  "to": newGrat.recipient.email,
                  "from": newGrat.sender.email,
                  "subject": newGrat.sender.fullname + " sent you gratitude!",
                  "message": "You recieved a Grat!<br/><br/>" +
                     "<table><tr><td align='center' width='300' bgcolor='#08c' style='background: #08c; padding-top: 6px; padding-right: 10px; padding-bottom: 6px; padding-left: 10px; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #fff; font-weight: bold; text-decoration: none; font-family: Helvetica, Arial, sans-serif; display: block;'>" +
                     "<a href='" + gratLink + "' style='color: #fff; text-decoration: none;'>Click to view and save!</a></td></tr></table>"
               };


               $("#createBtn").html("Emailing...");

               $.post(gratzi.Server.url + "/email", email,
                  function (data) {
                     if (data.token == "Success") {
                        $('#info').show().html("Gratzi sent!");
                        $('#to').val('');
                        $('#message').val('');
                        $('#tags').val('');
                        //gratzi.Store.loadGratzi(function () {
                        //  window.location.href = "/#view";
                        //});
                        $createBtn.removeAttr("disabled");
                        $createBtn.html("Create");
                     }

                  }, "json").fail(function(error){
                     $('#fail').show().html("Failed to email.");
                     $createBtn.removeAttr("disabled");
                     $createBtn.html("Create");
                     console.log(error);
                  });
            }

         });

      });

   },

   pickfbContact: function (e) {

      var selector, logActivity, callbackFriendSelected, callbackFriendUnselected, callbackMaxSelection, callbackSubmit;

      // When a friend is selected, log their name and ID
      callbackFriendSelected = function (friendId) {
         var friend, name;
         friend = TDFriendSelector.getFriendById(friendId);
         name = friend.name;
         $("#zName").html(name);
         FB.api("/" + friendId + "/picture?width=180&height=180", function (response) {

            $("#zImage").attr("src", response.data.url);

         });

         console.log('Selected ' + name + ' (ID: ' + friendId + ')');
      };

      // When a friend is deselected, log their name and ID
      callbackFriendUnselected = function (friendId) {
         var friend, name;
         friend = TDFriendSelector.getFriendById(friendId);
         name = friend.name;
         console.log('Unselected ' + name + ' (ID: ' + friendId + ')');
      };

      // When the maximum selection is reached, log a message
      callbackMaxSelection = function () {
         console.log('Selected the maximum number of friends');
      };

      // When the user clicks OK, log a message
      callbackSubmit = function (selectedFriendIds) {
         $("#fbFriendId").val(selectedFriendIds[0]);
         console.log('Clicked OK with the following friends selected: ' + selectedFriendIds.join(", "));
      };

      // Initialise the Friend Selector with options that will apply to all instances
      TDFriendSelector.init({ debug: true });

      // Create some Friend Selector instances
      selector1 = TDFriendSelector.newInstance({
         callbackFriendSelected: callbackFriendSelected,
         callbackFriendUnselected: callbackFriendUnselected,
         callbackMaxSelection: callbackMaxSelection,
         callbackSubmit: callbackSubmit,
         maxSelection: 1,
         friendsPerPage: 5,
         autoDeselection: true
      });


      e.preventDefault();

      FB.getLoginStatus(function (response) {
         if (response.authResponse) {
            selector1.showFriendSelector();
            console.log("Facebook Logged in");
         } else {
            FB.login(function (response) {
               if (response.authResponse) {
                  console.log("Facebook Logged in");
                  selector1.showFriendSelector();
               } else {
                  console.log("Facebook login failed.");
                  //TODO: display message
               }
            }, {});
         }
      });


   },

   pickImage: function() {

      var files = $('input[id = upImage]')[0].files;
      var file = files[0];
      if (!file || !file.type.match(/image.*/)) return;

      var $btnPick = $("#btnPickImg");

      $btnPick.attr("disabled", "disabled");
      $btnPick.html("Uploading...");

      gratzi.Store.addImage(file, file.name, function (path) {
         $('#gImage').attr("src", path);
         $btnPick.removeAttr("disabled");
         $btnPick.html("Change Image");
         console.log("Image Uploaded: " + path);
      });
   }



});

