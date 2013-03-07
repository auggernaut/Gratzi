
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
    if ($.cookie('authenticated') == 'github') {
      store = git;
    }
    //DROPBOX
    else if ($.cookie('authenticated') == 'dropbox') {
      store = drop;
    }
    

    //Add Gratzi
    store.addGratzi(newGratzi, function (path) {

      //Get link to new file
      store.getLink(path, function (url) {

        var gratziLink = gratzi.Client.url + "/#view?" + url;

        var email = {
          "to": newGratzi.thankee,
          "from": gratzi.Server.emailFrom,
          "subject": newGratzi.thanker + " has sent you a Gratzi!",
          "message": "You recieved a Gratzi! Click this link to view it: <br/><br/>" + gratziLink
        }

        //Email link to recipient
        $.post(gratzi.Server.url + "/email", email,
          function (data) {
            if (data.token == "success") {
              $('#info').show().html("Gratzi sent!");
            }
          }, "json");

        $('#to').val('');
        $('#message').val('');
        $('#tags').val('');

      });

    });
      
  }


});



//*********************About View***************************//
gratzi.ViewView = Backbone.View.extend({

  events: {
    "click #update": "update"
  },

  initialize: function () {
    console.log('Initializing View View');
    this.render();
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  },

  update: function() {


  }

});



//************************Profile View*************************//
gratzi.ProfileView = Backbone.View.extend({

  events: {
    "click #logout": "logout",
    "click #dropbox": "authDropBox"
  },

  initialize: function () {
    console.log('Initializing ProfileView');
    this.render();
  },

  render: function () {

    var gitAuthUrl, username, ui, avatar, store;

    if ($.cookie('authenticated') == 'dropbox') {
      username = $.cookie("username");
      //avatar = $.cookie("avatar");
      //url = $.cookie("store");
    }
    else if ($.cookie('authenticated') == 'github') {
      username = $.cookie("username");
      avatar = $.cookie("avatar");
      ui = $.cookie("store");
      //gitRepo = $.cookie("repo");
    }
    else {
      gitAuthUrl = git.getAuthUrl(gratzi.Client.gitClientId);
    }

    $(this.el).html(this.template({ username: username, avatar: avatar, gitAuthUrl: gitAuthUrl, ui: ui, store: store }));

    return this;

  },

  authDropBox: function() {
    drop.authenticate(function (res) {
      console.log("Gettings DropBox account details...");
      drop.load(function (res) {
        console.log(res);
        window.location.href = "/#send";
      });
    });
  },

  logout: function () {
    git.logout();
    window.location.href = "/#";
  }

});