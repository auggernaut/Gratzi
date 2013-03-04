
//*********************Header View***************************//
gratzi.HeaderView = Backbone.View.extend({

  events: {
    //"click a": 'selectNavItem',
    "click #logout": "logout"
  },

  initialize: function () {
    console.log('Initializing Header View');
    this.render();
  },

  render: function (menuItem) {
    $(this.el).html(this.template());
    return this;
  },

 // selectNavItem: function (source) {
 //   this.render();
 //   $(source.target.getAttribute('href')).addClass("active");
 // },

  logout: function () {
    git.logout();
    this.render();
    window.location.href = "/#";
  }

});



//*********************Home View***************************//
gratzi.HomeView = Backbone.View.extend({

  initialize: function () {
    console.log('Initializing Home View');
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  }

});


//*********************About View***************************//
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





//************************Send View*************************//
gratzi.SendView = Backbone.View.extend({

  events: {
    'click #save': 'submit',
    'click #pickContact': 'pickContact'
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

  pickContact: function () {

    alert("gothere");
  },

  submit: function (e) {

    var newGratzi = {
      "thanker": $.cookie("username") + "@github.com",
      "thankee": $('#to').val(),
      "message": $('#message').val(),
      "tags": $('#tags').val()
    }

    //DEPLOYD
    //this.model.create(newGratzi);

    //REMOTESTORAGE
    //remoteStorage.semanticcurrency.addThankYou(this.model.toJSON()[0]);

    //GITHUB
    git.addGratzi(newGratzi, function (err, res) {
      if (!err) {
        var email = {
          "to": newGratzi.thankee,
          "from": gratzi.Server.emailFrom,
          "subject": newGratzi.thanker + " has sent you a Gratzi!",
          "message": "You recieved a Gratzi! Click this link to view it: <br/><br/>" + gratzi.Client.url
        }

        $.post(gratzi.Server.url + "/email", email,
          function (data) {
            if (data.token == "success") {
              $('#info').show().html("Gratzi sent!");
            }
          }, "json");

        $('#to').val('');
        $('#message').val('');
        $('#tags').val('');
      }
      else
        $('#info').show().html("Gratzi failed to create!");
    });

    

  }

});





//************************Profile View*************************//
gratzi.ProfileView = Backbone.View.extend({

  events: {
    "click #logout": "logout"
  },

  initialize: function () {
    console.log('Initializing ProfileView');
    this.render();
  },

  render: function (authUrl) {

    var authUrl, gitUser, gitRepo, gitAvatar;

    if (!$.cookie('oauth-token')) {
      authUrl = git.getAuthUrl(gratzi.Client.gitClientId);
    }
    else {
      gitUser = $.cookie("username");
      gitAvatar = $.cookie("avatar");
      //gitRepo = $.cookie("repo");
    }

    $(this.el).html(this.template({ gitUser: gitUser, gitRepo: gitRepo, gitAvatar: gitAvatar, gitAuthUrl: authUrl }));

    return this;

  },

  logout: function () {
    git.logout();
    window.location.href = "/#";
  }

});