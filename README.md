# Leaflet Routing Machine / GeoPortail

[![npm version](https://img.shields.io/npm/v/lrm-geoportail.svg)](https://www.npmjs.com/package/lrm-geoportail)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [IGN GéoServices services](https://geoservices.ign.fr/services-web).

Some brief instructions follow below, but the [Leaflet Routing Machine tutorial on alternative routers](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) is recommended.

## Installing

Go to the [releases page](https://github.com/tmuguet/lrm-geoportail/releases) to get the script to include in your page. Put the script after Leaflet, Leaflet Routing Machine and corslite have been loaded.

To use with for example Browserify:

```sh
npm install --save lrm-geoportail
```

## Using

There's a single class exported by this module, `L.Routing.GeoPortail`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
var L = require('leaflet');
var corslite = require('@mapbox/corslite');
require('leaflet-routing-machine');
require('lrm-geoportail'); // This will tack on the class to the L.Routing namespace

L.Routing.control({
    router: new L.Routing.GeoPortail(),
}).addTo(map);
```

### Available options

Options can be passed to the constructor, and/or to the `route` method:

```javascript
router = new L.Routing.GeoPortail({ resource: 'bdtopo-pgr' });
router.route(waypoints, callback, context, /* options */ { profile: 'pedestrian' });
```

* `timeout`: timeout for each request in ms (defaults to 10 seconds)
* `resource`: `bdtopo-osrm` (default) or `bdtopo-pgr`
* `profile`: `car` (default) or `pedestrian`
* `optimization`: `fastest` (default) or `shortest`

See [IGN GeoServices documentation](https://geoservices.ign.fr/services-web-experts-calcul#9436) and [API description](https://wxs.ign.fr/geoportail/itineraire/rest/1.0.0/getCapabilities) for reference.

## Known limitations

* Instructions are sometimes/mostly missing. This is due to limitations from the IGN API.

## Credits

This projet is a complete rip-off of Per Liedman's [lrm-graphhopper](https://github.com/perliedman/lrm-graphhopper) module.
