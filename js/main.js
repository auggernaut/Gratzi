var profile = {};

window.Router = Backbone.Router.extend({

    routes: {
        "": "send",
        "send": "send",
        "about": "about",
        "profile": "profile"
    },

    initialize: function () {

        var self = this;

        //IF Profile Exists, Grab

        //ELSE Show create new profile screen

        //Grab the profile details
        //TODO: Profile Id should come from connected account
        var prof = new Profile({ id: 'cb38d97a895cd85b' });

        prof.fetch({
            success: function () {
                profile = prof;
            }
        });

        // Register event listener for back button troughout the app
        $('#content').on('click', '.header-back-button', function (event) {
            window.history.back();
            return false;
        });

    },

    about: function () {
        // Since the contact view never changes, we instantiate it and render it only once
        if (!this.aboutView) {
            this.aboutView = new AboutView();
            this.aboutView.render();
        } else {
            this.homeView.delegateEvents(); // delegate events when the view is recycled
        }
        this.slidePage(this.aboutView);
    },

    send: function () {

    },

    profile: function () {

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