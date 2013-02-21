
window.Gratzi = Backbone.Model.extend({
    urlRoot: "http://stormy-savannah-7720.herokuapp.com/thank-yous",
    defaults: {
        id: null,
        thanker: "thanker",
        thankee: "thankee",
        reason: "some reason",
        tags: "tags"
    }
});

window.Profile = Backbone.Model.extend({
    urlRoot: "http://stormy-savannah-7720.herokuapp.com/users",
    defaults: {
        id: null,
        username: "betaTester",
        displayName: "Beta Tester",
        email: "beta@tester.com"
    }
});