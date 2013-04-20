
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

