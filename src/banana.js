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
     Banana.thief = new ColorThief();

     if (typeof(options.googleApi) === "undefined") {
         throw {
             message: "Error: NamedColors: The Google API was not passed, please pass {googleApi: google}"
         };
     }

     var log = function() {
         if (options.debug) console.log.apply(console, arguments);
     };

     options.googleApi.load("search", "1");

     function getImageColor(url) {
         return new Promise(function(resolve) {
             var img = new Image();
             img.crossOrigin = "";
             img.onload = function() {
                 try {
                     var color = Banana.thief.getColor(img, 10);
                     resolve(color);
                 } catch (e) {
                     log("Bananajs: Image download failed");
                     resolve(null);
                 }
             };
             img.onerror = function() {
                 resolve(null);
             };
             img.src = url;
         });
     }

     function getRGBData(colorName) {
         return new Promise(function(resolve, reject) {
             // Create an Image Search instance.
             var imageSearch = new options.googleApi.search.ImageSearch();

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
                     promises.push(getImageColor(image.url));
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
         getRGBData(colorName).then(function(data) {
             var r = 0,
                 g = 0,
                 b = 0,
                 count = 0;
             data.forEach(function(color) {
                 if (color !== null) {
                     count++;
                     r += color[0];
                     g += color[1];
                     b += color[2];
                 }
             });
             log("Bananajs: Finished processing, color: ", r, g, b);
             r /= count;
             g /= count;
             b /= count;
             r = Math.round(r);
             g = Math.round(g);
             b = Math.round(b);

             resolve([r, g, b]);
         });
     }

     // Expose API
     Banana.getColor = function(colorName) {
         log("Bananajs: Processing color for '" + colorName + "'");
         return new Promise(
             // The resolver function is called with the ability to resolve or
             // reject the promise
             function(resolve, reject) {
                 getColor(colorName, resolve, reject);
             }
         );
     };

     Banana.getPalette = function(colorName) {
         log("Bananajs: Processing palette for '" + colorName + "'");
         return new Promise(
             // The resolver function is called with the ability to resolve or
             // reject the promise
             function(resolve, reject) {
                 getPalette(colorName, resolve, reject);
             }
         );
     }
 };
