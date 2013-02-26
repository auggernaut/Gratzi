
//*********************Header View***************************//
gratzi.HeaderView = Backbone.View.extend({

  events: {
    "click a" : 'selectNavItem'
  },

  initialize: function () {
    console.log('Initializing Header View');
    this.render();
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  },

  selectNavItem: function (source) { 
    this.render();
    $(source.target.getAttribute('href')).addClass("active");
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
    this.model = gratzi.About;
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


    //this.model.create({
    //  thanker: $.cookie("username"),
    //  thankee: $('#to').val(),
    //  reason: $('#reason').val(),
    //  tags: $('#tags').val()
    //});



    //navigator.notification.alert(
    //    'Thank you sent!',  // message
    //    function () {
    //      return;
    //    },         // callback
    //    'Success',            // title
    //    'Ok'                  // buttonName
    //);

    //remoteStorage.semanticcurrency.addThankYou(this.model.toJSON()[0]);

    //SEND TO GITHUB
    var newGratzi = {
      "thanker": $.cookie("username"),
      "thankee": $('#to').val(),
      "reason": $('#reason').val(),
      "tags": $('#tags').val()
    }

    git.addGratzi(newGratzi, function (err, res) {
      $('#message').show().html("Thank you sent!");
    });

    $('#to').val('');
    $('#reason').val('');
    $('#tags').val('');

    
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

    if (!$.cookie('git-oauth-token')) {
      authUrl = git.getAuthUrl(gratzi.About.gitClientId);
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
  }

});