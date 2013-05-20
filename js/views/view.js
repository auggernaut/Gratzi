/*global Backbone, Gratzi, _ */

//************************  LIST *********************************//
Gratzi.ListView = Backbone.View.extend({


   events: {
      "click #reload": "reload",
      "change #ddTags": "tagSelect"
   },

   initialize: function () {
      "use strict";
      console.log('Initializing List View');

      this.render();

   },

   render: function (pickTag) {
      "use strict";
      var zis = JSON.parse(localStorage.getItem("zis"));
      var grats = JSON.parse(localStorage.getItem("grats"));
      var tags = [], ts, grater, gratee, zier, jZi, jGrat, gId, match;

      if (!grats) {
         //No grats yet... render just the ListView
         $(this.el).html(this.template({ tags: {} }));
         return;
      }
      else {

         //Get tag list, render ListView
         _.each(grats, function (grat) {

            ts = JSON.parse(grat).tags.split(",");

            _.each(ts, function (t) {
               tags[t] = t.trim();
            });
         });

         $(this.el).html(this.template({ tags: tags }));

         //Render all Gratzi in ListItemViews
         _.each(grats, function (grat, id) {

            jGrat = JSON.parse(grat);
            grater = new Gratzi.Profile();
            grater.load(jGrat.sender);

            gratee = new Gratzi.Profile();
            gratee.load(jGrat.recipient);

            if (!pickTag || jGrat.tags.indexOf(pickTag) !== -1) {
               match = false;

               _.each(zis, function (zi) {
                  jZi = JSON.parse(zi);
                  zier = new Gratzi.Profile();
                  zier.load(jZi.sender);

                  gId = jZi.grat ? jZi.grat.substr(jZi.grat.lastIndexOf("/") + 1) : "empty";

                  if (id === gId) {
                     match = true;
                     $(this.el).append(new Gratzi.ListItemView({ model: {
                        "grat": jGrat,
                        "zi": jZi,
                        "zier": zier,
                        "grater": grater }
                     }).render().el);
                  }
               }, this);

               if (!match) {
                  $(this.el).append(new Gratzi.ListItemView({ model: {
                     "grat": jGrat,
                     "zi": "",
                     "zier": gratee,
                     "grater": grater  }
                  }).render().el);
               }
            }
         }, this);

      }


   },

   tagSelect: function (e) {
      "use strict";
      this.render($(e.currentTarget).val());
   },

   reload: function () {
      "use strict";

      var $reload = $('#reload');
      $reload.attr("disabled", "disabled");
      $reload.html("Loading...");

      Gratzi.Store.loadGratzi(function () {
         window.location.reload();
      });

   }

});


//************************   LIST ITEM   *************************//

Gratzi.ListItemView = Backbone.View.extend({


   render: function () {
      "use strict";
      $(this.el).html(this.template(this.model));
      return this;
   }


});
