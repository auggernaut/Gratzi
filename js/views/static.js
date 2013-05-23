
//*********************   HEADER    ***************************//
Gratzi.HeaderView = Backbone.View.extend({

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

Gratzi.FooterView = Backbone.View.extend({

  events: {
    "click #logout": "logout"
  },

  initialize: function () {
    console.log('Initializing Footer View');
    this.model = Gratzi.Client;
    this.render();
  },

  render: function () {
    $(this.el).html(this.template(this.model));
    return this;
  },

  logout: function () {
    Gratzi.Store.logout();
    this.render();
    window.location.href = "/#";
    window.location.reload();
  }

});




//*********************   HOME   ***************************//

Gratzi.HomeView = Backbone.View.extend({

  initialize: function () {
    console.log('Initializing Home View');
  },

  render: function () {
    $(this.el).html(this.template());
    return this;
  }

});





//*********************   ABOUT    ***************************//

Gratzi.AboutView = Backbone.View.extend({

  initialize: function () {
    console.log('Initializing About View');
    this.model = Gratzi.Client;
  },

  render: function () {
    $(this.el).html(this.template(this.model));
    return this;
  }

});




//*********************   PRIVACY    ***************************//

Gratzi.PrivacyView = Backbone.View.extend({

   initialize: function () {
      console.log('Initializing Privacy View');
      this.model = Gratzi.Client;
   },

   render: function () {
      $(this.el).html(this.template(this.model));
      return this;
   }

});

//*********************   FEEDBACK    ***************************//

Gratzi.FeedbackView = Backbone.View.extend({

   events: {
      "click #btnSend" : "sendFeedback"
   },

   initialize: function () {
      console.log('Initializing Feedback View');
      //this.model = Gratzi.Client;
      this.render();
   },

   render: function () {
      $(this.el).html(this.template());
      return this;
   },

   sendFeedback: function() {
      "use strict";

      var $message = $("#message");
      var $btnSend = $("#btnSend");

      $btnSend.attr("disabled", "disabled");
      $btnSend.html("Sending...");

      email.sendFeedback($message.val(), function(res){

         if (res === "Success") {
            $message.val("Feedback sent!");

            //$message.val(" ");
         }
         else {
            $('#fail').show().html("Failed to send feedback.");
         }

         $btnSend.removeAttr("disabled");
         $btnSend.html("Send");

      });
   }




});


