/**
 * BananaJs
 * Get an RGB color palette from a set of keywords
 *
 * (c) 2015-2020 Alejandro U. Alvarez
 * Bananajs may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://github.com/aurbano/bananajs
 *
 * @author Alejandro U. Alvarez <urbanoalvarez.es>
 * @license MIT License
 */
"use strict";

var Bananajs = function(options) {

  var Banana = this;

  if (typeof(options.googleApi) === "undefined") {
    throw {
      message: "Error: Bananajs: The Google API was not passed, please pass {googleApi: google}"
    };
  }

  if (typeof(ColorThief) === "undefined") {
    throw {
      message: "Error: Bananajs: Please include ColorThief"
    };
  }

  Banana.thief = new ColorThief();
  // Banana settings
  Banana.options = {
    debug: options.debug || false, // debug on/off
    quality: options.quality || 10, // quality setting for Color Thief
    minImages: options.minImages || 1, // minimum number of images required for sampling
    images: options.images || 10, // initial number of images requested to google
    maxImages: options.maxImages || 4 // maximum number of failed images before giving up
  };

  var log = function() {
    if (Banana.options.debug) console.log.apply(console, arguments);
  };

  options.googleApi.load("search", "1");

  function getImageColor(url, number) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.crossOrigin = "";
      img.onload = function() {
        try {
          resolve({
            color: Banana.thief.getColor(img, Banana.options.quality || 10),
            palette: Banana.thief.getPalette(img, number)
          });
        } catch (e) {
          log("Bananajs: Image download failed");
          resolve(null);
        }
      };
      img.onerror = function(e) {
        log("Bananajs: Image download failed");
        resolve(null);
      };
      img.src = url;
    });
  }

  function getRGBData(colorName, number) {
    return new Promise(function(resolve, reject) {
      // Create an Image Search instance.
      var imageSearch = new options.googleApi.search.ImageSearch();

      imageSearch.setResultSetSize(Banana.options.images);

      // Set searchComplete as the callback function when a search is 
      // complete.  The imageSearch object will have results in it.
      imageSearch.setSearchCompleteCallback(this, function() {
        var images = imageSearch.results;
        if (images.length < 1) {
          log("Bananajs: No images found");
          reject({
            message: "No results"
          });
        }

        var promises = [];

        images.forEach(function(image) {
          log("Bananajs: Loading image: ", image.url);
          promises.push(getImageColor(image.url, number));
        });

        Promise.all(promises).then(function(data) {
          resolve(data);
        });
      }, null);

      // Find me a beautiful car.
      imageSearch.execute(colorName);
    });
  }

  function getColor(colorName, resolve) {
    getRGBData(colorName, 0).then(function(data) {
      var r = 0,
        g = 0,
        b = 0,
        count = 0;
      data.forEach(function(info) {
        if (info !== null) {
          count++;
          r += info.color[0];
          g += info.color[1];
          b += info.color[2];
        }
      });
      r /= count;
      g /= count;
      b /= count;
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);

      log("Bananajs: Finished processing (sampled "+count+" images), color: ", r, g, b);

      resolve([r, g, b]);
    });
  }

  function getPalette(colorName, number, resolve) {
    getRGBData(colorName, number).then(function(data) {
      var palette = [],
        count = 0,
        i;
      for (i = 0; i < number; i++) {
        palette[i] = [0, 0, 0];
      }
      data.forEach(function(info) {
        if (info !== null && info.palette.length > 0) {
          count++;
          for (i = 0; i < info.palette.length; i++) {
            palette[i][0] += info.palette[i][0];
            palette[i][1] += info.palette[i][1];
            palette[i][2] += info.palette[i][2];
          }
        }
      });
      for (i = 0; i < palette.length; i++) {
        palette[i][0] = Math.round(palette[i][0] / count);
        palette[i][1] = Math.round(palette[i][1] / count);
        palette[i][2] = Math.round(palette[i][2] / count);
      }

      log("Bananajs: Finished processing (sampled "+count+" images), palette: ", palette);

      resolve(palette);
    });
  }

  // Expose API
  Banana.getColor = function(colorName) {
    log("Bananajs: Processing color for '" + colorName + "'");
    return new Promise(function(resolve, reject) {
      getColor(colorName, resolve, reject);
    });
  };

  Banana.getPalette = function(colorName, number) {
    log("Bananajs: Processing palette for '" + colorName + "'");
    return new Promise(function(resolve, reject) {
      getPalette(colorName, number, resolve, reject);
    });
  };
};
