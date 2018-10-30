Leaflet Routing Machine / GeoPortail
=====================================

[![npm version](https://img.shields.io/npm/v/lrm-geoportail.svg)](https://www.npmjs.com/package/lrm-geoportail)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [GeoPortail](https://depot.ign.fr/geoportail/api/develop/tech-docs-js/developpeur/geodrm.html).

Some brief instructions follow below, but the [Leaflet Routing Machine tutorial on alternative routers](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) is recommended.

## Installing

Go to the [releases page](https://github.com/tmuguet/lrm-geoportail/releases) to get the script to include in your page. Put the script after Leaflet, Leaflet Routing Machine and GeoPortail have been loaded.

To use with for example Browserify:

```sh
npm install --save lrm-geoportail
```

## Using

There's a single class exported by this module, `L.Routing.GeoPortail`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-geoportail'); // This will tack on the class to the L.Routing namespace

L.Routing.control({
    router: new L.Routing.GeoPortail('your GeoPortail API key'),
}).addTo(map);
```

Note that you will need to pass a valid GeoPortail API key to the constructor.

## Credits

This projet is a complete rip-off of Per Liedman's [lrm-graphhopper](https://github.com/perliedman/lrm-graphhopper) module.
