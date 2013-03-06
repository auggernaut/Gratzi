var dropbox;

drop = {

  authenticate: function (callback) {

    this.dropbox = new Dropbox.Client({
      key: "InhyNFQjbJA=|tRdHzxyrdUmc6PfXSK9gyJNbdcR9QNosDrJjoz9B0Q==", sandbox: true
    });

    this.dropbox.authDriver(new Dropbox.Drivers.Redirect({ rememberUser: true }));

    this.dropbox.authenticate(function (error, db) {
      if (error) {
        // Replace with a call to your own error-handling code.
        //
        // Don't forget to return from the callback, so you don't execute the code
        // that assumes everything went well.
        return showError(error);
      }

      // Replace with a call to your own application code.
      //
      // The user authorized your app, and everything went well.
      // db is a Dropbox.Client instance that you can use to make API calls.
      $.cookie('authenticated', 'dropbox');
      this.dropbox = db;
      callback(db);
    });

  },

  load: function (callback) {

    this.dropbox.getUserInfo(function (error, userInfo) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      //GET PROFILE PHOTO
      //$.cookie("avatar", res.avatar_url);


      $.cookie("username", userInfo.name);

      callback("Hello, " + userInfo.name + "!");
    });

  },

  addGratzi: function (newGratzi, callback) {

    //var filename = newGratzi.thanker + "->" + newGratzi.thankee;
    var filename = getHash(newGratzi);
    
    this.dropbox.writeFile(filename, JSON.stringify(newGratzi), function (error, stat) {
      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.path);
    });

  },

  getLink: function(path, callback){
    
    this.dropbox.makeUrl(path, {"download": "true"}, function (error, stat) {

      if (error) {
        return showError(error);  // Something went wrong.
      }

      callback(stat.url);

    });


  },

  logout: function () {

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

/*
dropbox.onError.addListener(function (error) {
  if (window.console) {  // Skip the "if" in node.js code.
    console.error(error);
  }
});

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