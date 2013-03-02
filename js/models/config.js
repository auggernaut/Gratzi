var gratzi = {};

gratzi.Client = {

  appName: "Gratzi",
  description: "Send a digital, signed thank you.",
  createdBy: "Datacosmos LLC",
  year: "2013",
  gitRepo: "http://github.com/auggernaut/gratzi",
  gitUser: "auggernaut",
  gitClientId: "bbee6e8255728de31711",
  url: "http://www.datacosmos.com/gratzi"

};

gratzi.Server = {
  url: "http://localhost:9999",
  emailFrom: "gratzi@datacosmos.com"
}

gratzi.store = dropbox;
gratzi.store = github;