 /**
  * BananaJs
  * Get an RGB color palette from a set of keywords
  *
  * @author Alejandro U. Alvarez <urbanoalvarez.es>
  * @homepage http://github.com/aurbano/bananajs
  * @license MIT License
  */
 "use strict";

 var Bananajs = function(options) {

     var Colors = this;
     Colors.thief = new ColorThief();

     if (typeof(options.googleApi) === "undefined") {
         throw {
             message: "Error: NamedColors: The Google API was not passed, please pass {googleApi: google}"
         };
     }

     var log = function() {
         if (options.debug) console.log.apply(console, arguments);
     }

     options.googleApi.load("search", "1");

     function getImageColor(url) {
         return new Promise(function(resolve) {
             var img = new Image();
             img.crossOrigin = '';
             img.onload = function() {
                 try {
                     var color = Colors.thief.getColor(img);
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

     function getImages(colorName, resolve, reject) {
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

                 resolve([r, g, b]);
             });
         }, null);

         // Find me a beautiful car.
         imageSearch.execute(colorName);
     }

     // Expose API
     Colors.getColor = function(colorName) {
         log("Bananajs: Processing '"+colorName+"'");
         return new Promise(
             // The resolver function is called with the ability to resolve or
             // reject the promise
             function(resolve, reject) {
                 getImages(colorName, resolve, reject);
             }
         );
     };
 };
