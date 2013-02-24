var profile = {};

window.Router = Backbone.Router.extend({

    routes: {
        "": "start",
        "send": "send",
        "about": "about",
        "profile": "profile"
    },

    initialize: function () {

        var self = this;

        // Register event listener for back button troughout the app
        $('#content').on('click', '.header-back-button', function (event) {
            window.history.back();
            return false;
        });

    },

    start: function(code) {

        var match = window.location.href.match(/\?code=([a-z0-9]*)/);

        // Handle Code
        if (match) {
            console.log("Getting access token...");
            git.authenticate(match[1], function(){

                console.log("Gettings Git account details...");
                git.load(function(result, data){
                    //if(result != null && result == "err")
                    //{
                    //    console.log(err);
                    //}
                    //else
                    console.log(data);

                    window.location.href="/#send";

                });
            });
        }
        else if(window.authenticated)
            window.location.href="/#send";              
        else
            window.location.href="/#profile";
        
    },

    about: function () {
        // Since the contact view never changes, we instantiate it and render it only once
        if (!this.aboutView) {
            this.aboutView = new AboutView();
            this.aboutView.render();
        } else {
            this.aboutView.delegateEvents(); // delegate events when the view is recycled
        }
        this.slidePage(this.aboutView);
    },

    send: function () {
        this.slidePage(new SendView());
    },

    profile: function () {
        this.slidePage(new ProfileView({model: new AboutModel()}));            
    },

    slidePage: function (page) {
        var slideFrom,
            self = this;

        if (!this.currentPage) {
            // If there is no current page (app just started) -> No transition: Position new page in the view port
            $(page.el).attr('class', 'page stage-center');
            $('#content').append(page.el);
            this.pageHistory = [window.location.hash];
            this.currentPage = page;
            return;
        }

        // Cleaning up: remove old pages that were moved out of the viewport
        $('.stage-right, .stage-left').remove();

        if (window.location.hash === "") {
            // Always apply a Back (slide from left) transition when we go back to the home page
            slideFrom = "left";
            $(page.el).attr('class', 'page stage-left');
            // Reinitialize page history
            this.pageHistory = [window.location.hash];
        } else if (this.pageHistory.length > 1 && window.location.hash === this.pageHistory[this.pageHistory.length - 2]) {
            // The new page is the same as the previous page -> Back transition
            slideFrom = "left";
            $(page.el).attr('class', 'page stage-left');
            this.pageHistory.pop();
        } else {
            // Forward transition (slide from right)
            slideFrom = "right";
            $(page.el).attr('class', 'page stage-right');
            this.pageHistory.push(window.location.hash);
        }

        $('#content').append(page.el);

        // Wait until the new page has been added to the DOM...
        setTimeout(function () {
            // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
            $(self.currentPage.el).attr('class', 'page transition ' + (slideFrom === "right" ? 'stage-left' : 'stage-right'));
            // Slide in the new page
            $(page.el).attr('class', 'page stage-center transition');
            self.currentPage = page;
        });
    }

});

//templateLoader function defined in utils.js
templateLoader.load(["AboutView", "SendView", "ProfileView"],
    function () {
        app = new Router();
        Backbone.history.start();
    });