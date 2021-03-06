var vsprintf = require("sprintf-js").vsprintf;

var I18n = function(options){
  for (var prop in options) {
    this[prop] = options[prop];
  }
};

I18n.localeCache = {};

I18n.prototype = {
  defaultLocale: "en",
  directory: "/locales",
  extension: ".json",

  init: function(callback) {
    this.setLocale(this.locale, callback);
  },

  getLocale: function(){
    return this.locale;
  },

  setLocale: function(locale, callback) {
    if (!locale) {
      if (navigator && navigator.language) {
        locale = navigator.language;
      } else {
        locale = this.defaultLocale;
      }
    }

    this.locale = locale;
    if (locale in I18n.localeCache) {
      if (callback) {
        callback();
      }
    } else {
      this.getLocaleFileFromServer(callback);
    }
  },
  getLocaleFileFromServer: function(callback) {
    var localeFile = null;

    var locale = this.locale;
    var request = new XMLHttpRequest();
    request.open('GET', this.directory + "/" + this.locale +
        this.extension + "?_="+Date.now(), true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        localeFile = JSON.parse(request.response);
        I18n.localeCache[locale] = localeFile;
        console.log("done setting localeFile ", I18n.localeCache);
        if (callback) {
          callback();
        }
      }
    };
    request.send();
    // request.onerror = function() { }
  },
  objPathFromString: function(str) {
    function index(obj,i) {
      return obj[i];
    }
    return str.split('.').reduce(index, I18n.localeCache[this.locale]);
  },
  __: function() {
    var msg = arguments[0] || '';
    if (msg.indexOf('.') >= 0) {
      try {
        msg = this.objPathFromString(msg);
      } catch (e) {
        msg = "_"+arguments[0];
      }
    } else {
      if (!I18n.localeCache[this.locale][msg]) {
        msg = "_"+msg;
      } else {
        msg = I18n.localeCache[this.locale][msg];
      }
    }
    if (arguments.length > 1) {
      msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
    }
    return msg;
  },
  __n: function(singular, count) {
    var msg = singular;
    try {
      msg = this.objPathFromString(msg);
    } catch (e) {
      msg = "_"+singular;
    }
    count = parseInt(count, 10);
    if (count === 0) {
      msg = msg.zero;
    } else {
      msg = count > 1 ? msg.other : msg.one;
    }
    msg = vsprintf(msg, [count]);
    if (arguments.length > 2) {
      msg = vsprintf(msg, Array.prototype.slice.call(arguments, 2));
    }
    return msg;
  }
};

module.exports = I18n;
