
//************************  LIST *********************************//
gratzi.ListView = Backbone.View.extend({

  events: {
    "click #reload": "reload",
    "change #ddTags": "tagSelect"
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
      var tag;
      var g = grats[grat];
      var ts = JSON.parse(g).tags.split(",");

      for (var t in ts) {
        tag = ts[t].trim();
        tags[tag] = tag;
      }

      $(this.el).html(this.template({ tags: tags }));
    }

    //Render all gratzi in ListItemViews
    for (var grat in grats) {
      var gJSON = JSON.parse(grats[grat]);

      if (!pickTag || gJSON.tags.indexOf(pickTag) != -1) {
        var match = false;

        for (var zi in zis) {
          var ziJSON = JSON.parse(zis[zi]);
           //Should never be empty... TODO: test for empty grat in zi
          var gId = ziJSON.grat ? ziJSON.grat.substr(ziJSON.grat.lastIndexOf("/") + 1) : "empty";

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
