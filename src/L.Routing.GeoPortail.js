const L = require('leaflet');
const Gp = require('geoportal-access-lib');

if (L.Routing === undefined) {
  L.Routing = {};
}

L.Routing.GeoPortail = L.Evented.extend({
  options: {
    profile: 'Voiture', // Or 'Pieton'
  },

  initialize(apiKey, options) {
    this._apiKey = apiKey;
    L.Util.setOptions(this, options);
  },

  route(waypoints, callback, context, options = {}) {
    // Merge the options so we get options defined at L.Routing.GeoPortail creation
    const _options = this.options;
    const optionsKeys = Object.keys(options);
    for (let i = 0; i < optionsKeys.length; i += 1) {
      const attrname = optionsKeys[i];
      _options[attrname] = options[attrname];
    }

    const wps = [];
    for (let i = 0; i < waypoints.length; i += 1) {
      const wp = waypoints[i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options,
      });
    }

    const routeOpts = this.buildRouteOpts(wps, _options);
    routeOpts.onSuccess = (results) => {
      this._handleGeoPortailSuccess(results, wps, callback, context);
    };
    routeOpts.onFailure = (error) => {
      this._handleGeoPortailError(error, callback, context);
    };

    Gp.Services.route(routeOpts);
    return this;
  },

  _handleGeoPortailSuccess(results, wps, callback, context) {
    const ctx = context || callback;

    const coordinates = [];
    const instructions = [];
    for (let i = 0; i < results.routeInstructions.length; i += 1) {
      const instruction = results.routeInstructions[i];

      instructions.push({
        type: this._instructionToType(instruction),
        text: instruction.instruction,
        distance: instruction.distance,
        time: instruction.duration,
        index: coordinates.length,
      });

      for (let j = 0; j < instruction.geometry.coordinates.length; j += 1) {
        const coords = instruction.geometry.coordinates[j];
        coordinates.push(L.latLng(coords[1], coords[0]));
      }
    }

    const alt = {
      name: '',
      coordinates,
      instructions,
      summary: {
        totalDistance: results.totalDistance,
        totalTime: results.totalTime, // TODO: unit?
        totalAscend: 0, // unsupported?
      },
      inputWaypoints: wps,
      actualWaypoints: [
        {
          latLng: coordinates[0],
          name: wps[0].name,
        },
        {
          latLng: coordinates[coordinates.length - 1],
          name: wps[wps.length - 1].name,
        },
      ],
      waypointIndices: [0, coordinates.length - 1],
    };

    callback.call(ctx, null, [alt]);
  },

  _handleGeoPortailError(error, callback, context) {
    callback.call(context || callback, {
      status: -1,
      message: `GeoPortail route failed: ${error}`,
      response: null,
    });
  },

  buildRouteOpts(waypoints, options) {
    const wps = [];
    let i;
    for (i = 0; i < waypoints.length; i += 1) {
      const wp = waypoints[i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options,
      });
    }

    const startLatLng = wps.shift().latLng;
    const endLatLng = wps.pop().latLng;

    const viaPoints = [];

    for (i = 0; i < wps.length; i += 1) {
      const viaPoint = wps[i].latLng;
      viaPoints.push({ x: viaPoint.lng, y: viaPoint.lat });
    }

    const opt = {
      distanceUnit: 'm',
      endPoint: {
        x: endLatLng.lng,
        y: endLatLng.lat,
      },
      exclusions: [],
      geometryInInstructions: true,
      graph: options.profile,
      routePreferences: 'fastest',
      startPoint: {
        x: startLatLng.lng,
        y: startLatLng.lat,
      },
      viaPoints,
      apiKey: this._apiKey,
    };

    return opt;
  },

  _instructionToType(instruction) {
    switch (instruction.code) {
      case 'BL':
        return 'SharpLeft';
      case 'L':
        return 'Left';
      case 'R':
        return 'Right';
      default:
        return '';
    }
  },
});

L.Routing.geoPortail = function geoPortail(apiKey, options) {
  return new L.Routing.GeoPortail(apiKey, options);
};

module.exports = L.Routing.GeoPortail;
