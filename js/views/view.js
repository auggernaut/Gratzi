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
      var tag, tags = [], g, ts;

      if (!grats) {
         //No grats yet... render just the ListView
         $(this.el).html(this.template({ tags: {} }));
         return;
      }
      else {
         //Load grats and zis

         //Get tag list, render ListView
         _.each(grats, function (grat) {
            g = grats[grat];
            ts = JSON.parse(g).tags.split(",");

            _.each(ts, function (t) {
               tag = ts[t].trim();
               tags[tag] = tag;
            });

            $(this.el).html(this.template({ tags: tags }));
         });

         //Render all Gratzi in ListItemViews
         _.each(grats, function (grat) {
            var gJSON = JSON.parse(grats[grat]);

            if (!pickTag || gJSON.tags.indexOf(pickTag) !== -1) {
               var match = false;

               _.each(zis, function (zi) {
                  var ziJSON = JSON.parse(zis[zi]);
                  //Should never be empty... TODO: test for empty grat in zi
                  var gId = ziJSON.grat ? ziJSON.grat.substr(ziJSON.grat.lastIndexOf("/") + 1) : "empty";

                  if (grat === gId) {
                     match = true;
                     $(this.el).append(new Gratzi.ListItemView({ model: { gratid: gId, "grat": gJSON, "zi": ziJSON } }).render().el);
                  }

                  if (!match) {
                     $(this.el).append(new Gratzi.ListItemView({ model: { gratid: gId, "grat": gJSON, "zi": { "from": {}, to: {}, message: "" } } }).render().el);
                  }
               });
            }
         });

      }


   },

   tagSelect: function (e) {
      "use strict";
      this.render($(e.currentTarget).val());
   },

   reload: function () {
      "use strict";
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
