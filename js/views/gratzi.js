
//************************Send Views*************************//
window.SendView = Backbone.View.extend({

    events: {
        'click #save': 'submit',
        //'click #pickContact': 'pickContact'
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

    submit: function (e) {

        
        this.model.create({
            thanker: profile.id,
            thankee: $('#to').val(),
            reason: $('#reason').val(),
            tags: $('#tags').val()
        });
        

        $('#to').val('');
        $('#reason').val('');
        $('#tags').val('');

        $('#message').show().html("Thank you sent!");

        navigator.notification.alert(
            'Thank you sent!',  // message
            function () {
                return;
            },         // callback
            'Success',            // title
            'Ok'                  // buttonName
        );
        
        //remoteStorage.semanticcurrency.addThankYou(this.model.toJSON()[0]);

        //SEND TO GITHUB
    }

});





//************************Profile View*************************//
window.ProfileView = Backbone.View.extend({


    initialize: function () {
        console.log('Initializing ProfileView');
        this.render();
    },

    render: function () {
        var thankyous = this.model.models;
        /*remoteStorage.semanticcurrency.getThankYous().then(
            function (tys) {
                console.log(tys);
            });
            */

        $(this.el).html(this.template(profile.toJSON()));

        _.each(thankyous, function (thankyou) {

            if (profile.id == thankyou.get("thanker"))
                $('.thankyous-sent', this.el).append(new ThankYouListItemView({ model: thankyou }).render().el);
            else if (profile.id == thankyou.get("thankee"))
                $('.thankyous-received', this.el).append(new ThankYouListItemView({ model: thankyou }).render().el);


        }, this);

        return this;
    }

});



