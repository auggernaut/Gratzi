/*global Backbone, Gratzi, _, ga, drop */

var utils = utils || {};

(function () {

   "use strict";
   utils.templateLoader = {
      // The Template Loader. Used to asynchronously load templates located in separate .html files
      load: function (views, callback) {

         var deferreds = [];

         $.each(views, function (index, name) {
            if (Gratzi[name]) {
               deferreds.push($.get('tpl/' + name + '.html', function (data) {
                  Gratzi[name].prototype.template = _.template(data);
               }, 'html'));
            } else {
               alert(name + " not found");
            }
         });

         $.when.apply(null, deferreds).done(callback);
      },

      // Get template by name from hash of preloaded templates
      get: function (name) {
         return Gratzi[name].prototype.template;
      }
   };

   utils.getHash = function (object) {
      var shaObj = new jsSHA(object, "TEXT");
      return shaObj.getHash("SHA-384", "HEX");
   };


   utils.json2hashtrix = function (json) {

      _.each(json, function(key) {
         var content = json[key];
         if (_.isObject(content)) {
            this.json2hashtrix(content);
         }
         else {
            // I am a leaf on the wind...
            var content_filename = this.getHash(content);
            var key_filename = this.getHash(key);
            console.log(key_filename, key, "~", content_filename, content);
         }
         // console.log( key, val );

      });

   };

   utils.utf8_to_b64 = function (str) {
      return window.btoa(encodeURIComponent(str));
   };


   utils.b64_to_utf8 = function (str) {
      return decodeURIComponent(window.atob(str));
   };

   utils.supports_html5_storage = function () {
      try {
         return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
         return false;
      }
   };

   utils.s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
         .toString(16)
         .substring(1);
   };

   utils.guid = function() {
      return utils.s4() + utils.s4() + '-' + utils.s4() + '-' + utils.s4() + '-' +
         utils.s4() + '-' + utils.s4() + utils.s4() + utils.s4();
   };

   utils.dtNow = function() {
      var date = new Date();

      function makeTwoDigits(val) {
         var prefix = val <= 9 ? "0" : "";
         return prefix + val;
      }
      //var dayOfWeek = date.getDay();                  // 0-6, 0=Sunday
      var month = date.getMonth();                    // 0-11
      var day = date.getDate();                       // 1-31
      var year = date.getFullYear();                  // 2013
      var hours = makeTwoDigits(date.getHours());     // 0-23
      var mins = makeTwoDigits(date.getMinutes());    // 0-59
      var secs = makeTwoDigits(date.getSeconds());    // 0-59

      //var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      //var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      return year + "-" + makeTwoDigits(month) + "-" + makeTwoDigits(day) + "T" + makeTwoDigits(hours) + ":" + makeTwoDigits(mins) + ":" + makeTwoDigits(secs) + "Z";

   };

}());


