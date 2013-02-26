// The Template Loader. Used to asynchronously load templates located in separate .html files
templateLoader = {

  load: function (views, callback) {

    var deferreds = [];

    $.each(views, function (index, name) {
      if (gratzi[name]) {
        deferreds.push($.get('tpl/' + name + '.html', function (data) {
          gratzi[name].prototype.template = _.template(data);
        }, 'html'));
      } else {
        alert(name + " not found");
      }
    });

    $.when.apply(null, deferreds).done(callback);
  },

  // Get template by name from hash of preloaded templates
  get: function (name) {
    return gratzi[name].prototype.template;
  }

};
