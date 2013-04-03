

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
  },

  getHash: function(object) {
    var shaObj = new jsSHA(JSON.stringify(object), "TEXT");
    return shaObj.getHash("SHA-384", "HEX");
  },

  session: {

    type: function () {
      return $.cookie('authenticated');
    },

    token: function () {
      return $.cookie('oath_token');
    },

    logout: function () {

    }

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
