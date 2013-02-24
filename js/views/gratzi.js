
//************************Send Views*************************//
window.SendView = Backbone.View.extend({

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

    pickContact: function(){

        alert("gothere");
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

    events: {
        "click #logout" : "logout" 
    },

    initialize: function () {
        console.log('Initializing ProfileView');

        //if(git.authenticate())
        //    console.log("authenticated! " + window.authenticated);
        
        this.render();
    },

    render: function (authUrl) {

        var authUrl, gitUser, gitRepo;

        if(!window.authenticated)
        {
            authUrl = git.getAuthUrl(this.model.gitClientId);
        }
        else
        {
            gitUser = this.model.gitUser;
            gitRepo = this.model.gitRepo;
        }

        $(this.el).html(this.template({gitUser: gitUser, gitRepo: gitRepo, gitAuthUrl: authUrl}));

        $("#gitLogin").hide();

        return this;
        
    },

    logout : function() {
        git.logout();
    }

});



