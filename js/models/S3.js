/*global Backbone, Gratzi, utils */

var s3 = s3 || {};

(function () {
   "use strict";

   function getCreds(filename, callback) {
      $.ajax({
         url: Gratzi.Servers.gateKeeper + "/getS3Creds/" + filename,
         dataType: "JSON",
         success: function (res) {
            console.log(Gratzi.Servers.gateKeeper + "/getS3Creds/" + filename + "  -  Returned: " + res);
            callback(res);
         },
         error: function (res, status, error) {
            console.log(error);
            //do some error handling here
            callback(error);
         }
      });
   }

   function postFile(fd, callback) {
      var xhr = new XMLHttpRequest();

      xhr.open("POST", Gratzi.Servers.tempStore);
      xhr.onload = function (res) {
         console.log(xhr.responseText);
         console.log(res);
         if (xhr.responseText) {
            callback(xhr.responseText);
         } else {
            callback("Success");
         }
      };
      xhr.send(fd);
   }

   s3.saveJSONP = function (json, callback) {

      getCreds("gratzi.json", function (creds) {
         var strJson = json.type + "Callback(" + JSON.stringify(json).split(')').join("&#41;") + ")";
         var filename = utils.getHash(strJson);
         var loc = json.type + "s/" + json.type + "_" + filename + ".json";

         var fd = new FormData();
         fd.append("key", loc);
         fd.append("AWSAccessKeyId", creds.s3Key);
         fd.append("acl", "public-read");
         fd.append("policy", creds.s3PolicyBase64);
         fd.append("signature", creds.s3Signature);
         fd.append("Content-Type", creds.s3Mime);
         fd.append("file", strJson);

         postFile(fd, function(res){
            if(res === "Success") {
               callback(loc);
            } else {
               callback("Failure");
            }

         });
      });

   };

   s3.saveImage = function (image, name, callback) {

      getCreds(name, function (creds) {
         var loc = "images/" + name;
         var fd = new FormData();
         fd.append("key", loc);
         fd.append("AWSAccessKeyId", creds.s3Key);
         fd.append("acl", "public-read");
         fd.append("policy", creds.s3PolicyBase64);
         fd.append("signature", creds.s3Signature);
         fd.append("Content-Type", creds.s3Mime);
         fd.append("file", image);

         postFile(fd, function(res){
            if(res === "Success") {
               callback(loc);
            } else {
               callback("Failure");
            }

         });
      });
   };


   s3.getLink = function (path, callback) {

      callback(Gratzi.Servers.tempStore + path);

   };

}());


