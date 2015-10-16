# ![Banana](https://raw.githubusercontent.com/aurbano/bananajs/master/assets/banana.gif) Bananajs

> Get a color from a keyword (give it banana, get yellow)

Bananajs takes the specified keyword and searches for it in Google Images. It then takes the returned images, looks at their dominant colors, and calculates the average of all.

### [Demo](http://urbanoalvarez.es/bananajs)

## Example

```js
// first load https://www.google.com/jsapi

var banana = new Banana({
  googleApi: google
});

banana.getColor("strawberry").then(function(color){
  // color is [198, 29, 28]
  // which is a nice dark red
});
```

## Usage

Bananajs requires the Google JS API to work, you just need to add:

```html
<script src="https://www.google.com/jsapi"></script>
```

After, load the `banana.js` file, and finally initialize a new instance with:

```js
var banana = new Banana({
  // Required
  googleApi: google,
  // Optional
  debug: true
});
```

*I decided to pass the `google` object as a parameter in case you have renamed it.*

Once you have the banana object there are two methods:

### `banana.getColor(string)`

This function takes any string, and returns a promise that when resolved will return one array of ints `[r,g,b]`.

```js
// Set the background of body as the color of a strawberry
banana.getColor("strawberry").then(function(color){
  document.body.style.background = "rgb("+color[0]+","+color[1]+","+color[2],")";
});
```

### `banana.getPalette(string, number)`

This function takes any string, and returns a promise that when resolved will return an array of arrays of ints `[r,g,b]`. You can specify how many colors you want in the palette in the `number` parameter.

```js
// Get 4 colors for the keyword "strawberry"
banana.getPalette("strawberry", 4).then(function(palette){
  // Use the first color as background
  document.body.style.background = "rgb("+palette[0][0]+","+palette[0][1]+","+palette[0][2],")";
});
```

## Contributing

Contributions to this extremely useful library are more than welcome, feel free to send a pull request to **the develop branch** with your proposed changes. Follow similar coding practices if possible.

## Meta

&copy; [Alejandro U. Alvarez](http://urbanoalvarez.es) (2015) - Licensed under the MIT License
