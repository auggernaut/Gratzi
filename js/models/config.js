/*global Backbone, utils */

var Gratzi = Gratzi || {};

(function () {
   "use strict";

   Gratzi.Client = {

      appName: "Gratzi",
      description: "Send, recieve, and store gratitude.",
      createdBy: "Augustin Bralley",
      createdByUrl: "http://www.gratzi.org",
      createdByBlog: "http://blog.gratzi.org",
      createdByTwitter: "http://twitter.com/gratziorg",
      createdByFacebook: "http://facebook.com/gratziorg",
      createdByGPlus: "https://plus.google.com/u/0/b/106872788528219610178/106872788528219610178",
      year: "2013",
      gitRepo: "http://github.com/auggernaut/gratzi",
      gitClientId: "bbee6e8255728de31711",
      url: "http://localhost:8888",
      betaCodes: "IIW16, Core"
   };

   Gratzi.Servers = {
      //gateKeeper: "http://mighty-plateau-1604.herokuapp.com",
      gateKeeper: "http://mighty-plateau-1604.herokuapp.com",
      email: "http://http://mighty-plateau-1604.herokuapp.com/email",
      //fileServer: "http://www.gratzi.org",
      fileServer: "http://http://www.gratzi.org",
      tempStore: "https://gratzi.s3.amazonaws.com/"
   };

   Gratzi.Grat = (function () {

      function Grat(sender, recipient, message, tags, image) {
         this.recipient = recipient;
         this.sender = sender;
         this.message = message;
         this.tags = tags;
         this.image = image;
      }

      Grat.prototype.json = function () {
         return {
            "version": "1.0",
            "type": "grat",
            "recipient": this.recipient,
            "sender": this.sender,
            "message": this.message,
            "tags": this.tags,
            "image": this.image
         };
      };


      /*
       Grat.prototype.jsonp = function(){
       return "gratCallback(" + JSON.stringify(Grat.json()).split(')').join("&#41;") + ")";
       };
       */

      return Grat;

   })();

   Gratzi.Zi = (function () {

      function Zi(sender, recipient, grat, message, tags, image) {
         this.sender = sender;
         this.recipient = recipient;
         this.grat = utils.b64_to_utf8(grat);
         this.message = message;
         this.tags = tags;
         this.image = image;
      }

      Zi.prototype.json = function () {
         return {
            "version": "1.0",
            "type": "zi",
            "recipient": this.recipient,
            "sender": this.sender,
            "grat": this.grat,
            "message": this.message,
            "tags": this.tags,
            "image": this.image
         };
      };

      /*
       Zi.prototype.jsonp = function(){
       return "ziCallback(" + JSON.stringify(Zi.json()).split(')').join("&#41;") + ")";
       };
       */

      return Zi;

   })();

   Gratzi.Profile = (function () {



      function Profile() {
         this.id = utils.guid();
         this.created = utils.dtNow();
         this.userType = "";
         this.email = "";
         this.userName = "";
         this.fullName = "";
         this.image = "";
         this.bio = "";
      }

      Profile.prototype.load = function(json){
         if(!json.version){                             //Old version

            this.userType = json.type;
            this.fullName = json.fullname;
            this.userName = this.email = json.email;
            this.bio = json.bio;
            this.email = json.email;
            this.image = json.image;

         } else if(json.version === "1.0"){            //Current version

            this.id = json.id;
            this.userType = json.userType;
            this.fullName = json.name.formatted;

            if (json.userType === "facebook") {
               this.userName = json.userName;
            } else {
               this.userName = this.email = json.emails[0];
            }

            this.created = json.meta.created;
            this.modified = json.meta.lastModified;
            this.image = json.photos[0].value;
            this.bio = json.bio;
         }

      };

      Profile.prototype.setLocation = function (url) {
         this.url = url;
         this.modified = utils.nowDateTime();
      };

      //SCIM - System for Cross-Domain Identity Management
      //http://tools.ietf.org/html/draft-ietf-scim-core-schema-01
      Profile.prototype.json = function () {
         return {
            "schemas": ["urn:scim:schemas:core:1.0"],
            "id": this.id,
            "version": "1.0",
            "meta": {
               "created": this.created,
               "lastModified": this.modified,
               "location": this.url
            },
            "name": {
               "formatted": this.fullName,
               "familyName": this.fullName.split(" ")[1],
               "givenName": this.fullName.split(" ")[0]
            },
            "userName": this.userName,
            "userType": this.userType,
            "bio": this.bio,
            "emails": [ this.email ],
            "photos": [
               {
                  "value": this.image,
                  "type": "photo"
               }
            ]
         };
      };

      return Profile;
   })();


})();
