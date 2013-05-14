/*global Backbone, utils */

var Gratzi  = Gratzi || {};

(function () {
   "use strict";

   Gratzi.Client = {

      appName: "Gratzi",
      description: "Send, recieve, and store gratitude.",
      createdBy: "Augustin Bralley",
      createdByUrl: "http://www.datacosmos.com",
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
      //gatekeeper: "http://mighty-plateau-1604.herokuapp.com",
      gateKeeper: "http://localhost:9999",
      //fileserver: "http://www.gratzi.org",
      defaultEmail: "augustin@gratzi.org",
      fileServer: "http://localhost:8888",
      tempStore: "https://gratzi.s3.amazonaws.com/"
   };

   Gratzi.Grat = (function() {

      function Grat(sender, recipient, message, tags){
         this.version = "1.0";
         this.type = "grat";
         this.recipient = recipient;
         this.sender = sender;
         this.message = message;
         this.tags = tags;
      }

      Grat.prototype.json = function(){
         return {
            "version": this.version,
            "type": this.type,
            "recipient": this.recipient,
            "sender": this.sender,
            "message": this.message,
            "tags": this.tags
         };
      };

/*
      Grat.prototype.jsonp = function(){
         return "gratCallback(" + JSON.stringify(Grat.json()).split(')').join("&#41;") + ")";
      };
*/

      return Grat;

   })();


   Gratzi.Zi = (function() {

      function Zi(sender, recipient, grat, message, tags){
         this.version = "1.0";
         this.type = "zi";
         this.recipient = recipient;
         this.sender = sender;
         this.grat = utils.b64_to_utf8(grat);
         this.message = message;
         this.tags = tags;
      }

      Zi.prototype.json = function(){
         return {
            "version": this.version,
            "type": this.type,
            "recipient": this.recipient,
            "sender": this.sender,
            "grat": this.grat,
            "message": this.message,
            "tags": this.tags
         };
      };

/*
      Zi.prototype.jsonp = function(){
         return "ziCallback(" + JSON.stringify(Zi.json()).split(')').join("&#41;") + ")";
      };
*/

      return Zi;

   })();

   Gratzi.Profile = (function(){

      function Profile(utype, fname, lname, id, imageUrl){
         this.id = utils.guid();
         this.fname = fname;
         this.lname = lname;
         this.utype = utype;

         if(utype === "facebook"){
            this.email = Gratzi.Servers.defaultEmail;
            this.username = id;
         } else if(utype === "email"){
            this.email = id;
            this.username = id;
         } else if(utype === "dropbox"){
            this.email = id;
            this.username = id;
         } else {
            this.username = id;
         }

         this.created = utils.dtNow();

         this.profileUrl = imageUrl;
      }

      Profile.prototype.setLocation = function(url){
         this.url = url;
         this.modified = utils.nowDateTime();
      };

      Profile.prototype.json = function(){
         return {
            "schemas":["urn:scim:schemas:core:1.0"],
            "id":this.id,
            "meta":{
               "created": this.created,
               "lastModified": this.modified,
               "location": this.url
            },
            "name":{
               "formatted": this.fname + " " + this.lname,
               "familyName": this.lname,
               "givenName":this.fname
            },
            "userName": this.username,
            "userType": this.utype,
            "emails":[ this.email ],
            "photos": [
               {
                  "value": this.profileUrl,
                  "type": "photo"
               }
            ]
         };
      };
   })();


})();
