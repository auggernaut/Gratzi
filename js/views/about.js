window.AboutView = Backbone.View.extend({

    initialize: function () {
        console.log('Initializing About View');
        this.model = new AboutModel();
    },

    render: function () {
        $(this.el).html(this.template( this.model ));
        return this;
    }

});
