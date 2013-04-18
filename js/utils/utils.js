

utils = {
  
  templateLoader: {
    // The Template Loader. Used to asynchronously load templates located in separate .html files
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
  },

  getHash: function(object) {
    var shaObj = new jsSHA(object, "TEXT");
    return shaObj.getHash("SHA-384", "HEX");
  },


  json2hashtrix: function(json){

    for(key in json){
      content = json[key];
      if (_.isObject(content)) {
        this.json2hashtrix(content);
      }
      else {
        // I am a leaf on the wind...
        content_filename = this.getHash(content);
        key_filename = this.getHash(key);
        console.log( key_filename, key, "~", content_filename, content  );
      }
      // console.log( key, val );

    }

  }

};

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
