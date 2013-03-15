var dropbox = new Dropbox.Client({
  key: "InhyNFQjbJA=|tRdHzxyrdUmc6PfXSK9gyJNbdcR9QNosDrJjoz9B0Q==", sandbox: true
});

dropbox.authDriver(new Dropbox.Drivers.Redirect({ rememberUser: true }));

drop = {

  auth: function (callback) {

    if (localStorage.getItem('authenticated')) {
      //Already authenticated
      dropbox.authenticate({ interactive: false }, function (error, db) {
        if (error) {
          console.log("Error authenticating: " + error);
          callback(showError(error), null);
        }

        localStorage.setItem('authenticated', 'dropbox');

        callback(null, db);
      });
    }

    else {
      //Not yet authenticated
      dropbox.authenticate({ interactive: true }, function (error, db) {
        if (error) {
          console.log("Error authenticating: " + error);
          callback(showError(error), null);
        }

        localStorage.setItem('authenticated', 'dropbox');

        //Load profile
        drop.load(callback);

      });

    }

  },

  load: function (callback) {

    //GET USER INFO
    dropbox.getUserInfo(function (error, userInfo) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      localStorage.setItem("username", userInfo.email);
      localStorage.setItem("userId", userInfo.uid);

      //GET PROFILE FILE
      //If more than one, get most recent
      //this.dropbox.findByName("/", "profile", function (error, files) {

      //  if (files.length > 0) {
      //    var mostRecent = files[0];

      //    for (var i = 0; i < files.length - 1; i++) {
      //      if ((files[i].modifiedAt - files[i + 1].modifiedAt) < 0)
      //        mostRecent = files[i + 1];
      //    }
      //    this.dropbox.readFile(mostRecent.path, function (error, stat) {
      //      $.cookie("profile", stat);
      //      callback(stat);
      //    });
      //  }
      //});

      //GET PROFILE FILE
      var myProfile = "/profile.json";
      dropbox.readFile(myProfile, function (error, stat) {

        if (error) {
          callback(showError(error), null);
        }

        //TODO: IF Profile doesn't exist, i.e. 404, callback("404", null);


        var profile = JSON.parse(stat);

        //Get public link to profile image
        //TODO: move this to saveMyProfile
        drop.getLink("/images/" + profile.image, function (imageURL) {

          profile.image = imageURL;

          callback(null, profile);

        });

        //GET GRATs
        drop.getFiles("grat", function (data) {
          console.log(data);

        });

      });

    });

  },

  saveMyProfile: function (profile, callback) {

    var filename = "/profile.json";

    //Write profile
    dropbox.writeFile(filename, JSON.stringify(profile), function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }


      //Get public link to profile
      drop.getLink(filename, function (profUrl) {

        callback(profUrl);

        //Rewrite profile
        //drop.updateMyProfile(profile, function (path) {
        //  callback(url);
        //});
      });



      callback(stat.path);
    });

  },



  updateMyProfile: function (profile, callback) {

    var filename = "/profile.json";

    dropbox.writeFile(filename, JSON.stringify(profile), function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.path);
    });

  },



  addProfile: function (profile, callback) {
    var filename = "profile_" + utils.getHash(profile) + ".json"

    dropbox.writeFile(filename, JSON.stringify(profile), function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.path);
    });
  },



  addGrat: function (grat, callback) {

    var filename = "/grat/grat_" + utils.getHash(grat) + ".json";

    dropbox.writeFile(filename, "gratCallback(" + JSON.stringify(grat) + ")", function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.path);
    });

  },



  addZi: function (zi, callback) {

    var filename = "/zi/zi_" + utils.getHash(zi) + ".json";

    dropbox.writeFile(filename, "ziCallback(" + JSON.stringify(zi) + ")", function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.path);
    });

  },



  addImage: function (image, filename, callback) {

    //Write image
    dropbox.writeFile("/images/" + filename, image, function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      drop.getLink(stat.path, function (imageURL) {

        callback(imageURL);

      });

    });

  },



  getLink: function (path, callback) {

    dropbox.makeUrl(path, { "download": "true", "downloadHack": "true" }, function (error, stat) {

      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.url);

    });

  },

  getFiles: function (filepart, callback) {

    dropbox.findByName("/" + filepart + "/", filepart, function (error, fileStats) {

      if (error) {
        return showError(error);  // Something went wrong.
      }

      if (fileStats.length > 0) {

        var files = {};
        var counter = 0;

        $.each(fileStats, function (index, value) {

          dropbox.readFile(fileStats[index].path,
            function (error, stat) {
              if (error) {
                return showError(error);  // Something went wrong.
              }
              console.log("Got file: " + stat);
              files[fileStats[index].path] = stat.replace(filepart + "Callback(", "").replace(")", "");
              counter++;

              if (fileStats.length == counter) {
                localStorage.setItem('grats', JSON.stringify(files));
                callback(files);
              }

            }
          );

        });

      }


    });
  },

  logout: function () {
    console.log("Logging out.");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem('authenticated');
    localStorage.removeItem('profile');
    localStorage.removeItem('grats');
  }

}


var showError = function (error) {
  switch (error.status) {
    case Dropbox.ApiError.INVALID_TOKEN:
      // If you're using dropbox.js, the only cause behind this error is that
      // the user token expired.
      // Get the user through the authentication flow again.
      break;

    case Dropbox.ApiError.NOT_FOUND:
      // The file or folder you tried to access is not in the user's Dropbox.
      // Handling this error is specific to your application.
      break;

    case Dropbox.ApiError.OVER_QUOTA:
      // The user is over their Dropbox quota.
      // Tell them their Dropbox is full. Refreshing the page won't help.
      break;

    case Dropbox.ApiError.RATE_LIMITED:
      // Too many API requests. Tell the user to try again later.
      // Long-term, optimize your code to use fewer API calls.
      break;

    case Dropbox.ApiError.NETWORK_ERROR:
      // An error occurred at the XMLHttpRequest layer.
      // Most likely, the user's network connection is down.
      // API calls will not succeed until the user gets back online.
      break;

    case Dropbox.ApiError.INVALID_PARAM:
    case Dropbox.ApiError.OAUTH_ERROR:
    case Dropbox.ApiError.INVALID_METHOD:
    default:
      // Caused by a bug in dropbox.js, in your application, or in Dropbox.
      // Tell the user an error occurred, ask them to refresh the page.
  }
};


dropbox.onError.addListener(function (error) {

  console.log(error);

});

/*

dropbox.getUserInfo(function (error, userInfo) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("Hello, " + userInfo.name + "!");
});

dropbox.writeFile("hello_world.txt", "Hello, world!\n", function (error, stat) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("File saved as revision " + stat.revisionTag);
});

dropbox.readFile("hello_world.txt", function (error, data) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert(data);  // data has the file's contents
});

dropbox.readdir("/", function (error, entries) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("Your Dropbox contains " + entries.join(", "));
});
*/