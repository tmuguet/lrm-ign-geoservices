const L = require('leaflet');
const corslite = require('@mapbox/corslite');

if (L.Routing === undefined) {
  L.Routing = {};
}

L.Routing.IgnGeoservices = L.Evented.extend({
  options: {
    serviceUrl: 'https://wxs.ign.fr/calcul/geoportail/itineraire/rest/1.0.0/route',
    timeout: 10 * 1000,
    resource: 'bdtopo-osrm', // or 'bdtopo-pgr'
    profile: 'car', // Or 'pedestrian'
    optimization: 'fastest', // or shortest
  },

  initialize(options) {
    L.Util.setOptions(this, options);
  },

  _routeDone(response, inputWaypoints, options, callback, context) {
    const alts = [];
    const route = {
      name: '',
      summary: {
        totalTime: response.duration,
        totalDistance: response.distance,
      },
      coordinates: response.geometry.coordinates.map(x => L.latLng(x[1], x[0])),
      waypoints: this._toWaypoints(response),
      waypointIndices: this._toWaypointsIndices(response),
      inputWaypoints,
      instructions: this._toInstructions(response),
    };

    alts.push(route);
    callback.call(context, null, alts);
  },

  _toWaypoint(str, name = null, options = {}) {
    const latlng = str.split(',');
    return new L.Routing.Waypoint(L.latLng(parseFloat(latlng[1]), parseFloat(latlng[0])), name, options);
  },

  _toWaypoints(response) {
    const wps = [this._toWaypoint(response.portions[0].start)];
    response.portions.forEach((x) => {
      wps.push(this._toWaypoint(x.end));
    });
    return wps;
  },

  _isValidStep(step) {
    return (step.geometry.coordinates.length > 2
       || step.geometry.coordinates[0][0] !== step.geometry.coordinates[1][0]
       || step.geometry.coordinates[0][1] !== step.geometry.coordinates[1][1]);
  },

  _toWaypointsIndices(response) {
    const indices = [0];
    let total = 0;
    response.portions.forEach((portion) => {
      portion.steps.forEach((step) => {
        if (this._isValidStep(step)) total += step.geometry.coordinates.length - 1;
      });
      indices.push(total);
    });
    return indices;
  },

  _toInstructions(response) {
    const instr = [];
    response.portions.forEach((portion) => {
      portion.steps.forEach((step) => {
        if (this._isValidStep(step)) {
          instr.push({
            distance: step.distance,
            time: step.duration,
            text: step.instruction
              || (step.attributes.name.cpx_numero
                + (step.attributes.name.nom_1_gauche || step.attributes.name.nom_1_droite)),
          });
        }
      });
    });
    return instr;
  },

  route(waypoints, callback, context, options = {}) {
    let timedOut = false;
    const _options = L.extend({}, this.options, options);

    const wps = waypoints.map(wp => ({
      latLng: wp.latLng,
      name: wp.name,
      options: wp.options,
    }));

    const routeOpts = this.buildRouteOpts(wps, _options);
    const url = _options.serviceUrl + L.Util.getParamString(routeOpts);

    const timer = setTimeout(() => {
      timedOut = true;
      callback.call(context || callback, {
        status: -1,
        message: 'IgnGeoservices request timed out.',
      });
    }, _options.timeout);

    // eslint-disable-next-line func-names
    const xhr = corslite(url, L.bind(function (err, resp) {
      const error = {};

      clearTimeout(timer);
      if (!timedOut) {
        if (!err) {
          try {
            try {
              const data = JSON.parse(resp.responseText);
              this._routeDone(data, wps, options, callback, context);
              return;
            } catch (ex) {
              error.status = -3;
              error.message = ex.toString();
            }
          } catch (ex) {
            error.status = -2;
            error.message = `Error parsing IgnGeoservices response: ${ex.toString()}`;
          }
        } else {
          error.message = `IgnGeoservices HTTP request failed: ${err.type}`
           + `${err.target && err.target.status ? ` HTTP ${err.target.status}: ${err.target.statusText}` : ''}`;
          error.url = url;
          error.status = -1;
          error.target = err;
        }

        callback.call(context || callback, error);
      } else {
        xhr.abort();
      }
    }, this));
    return xhr;
  },

  buildRouteOpts(waypoints, options) {
    const wps = waypoints.map(wp => ({
      latLng: wp.latLng,
      name: wp.name,
      options: wp.options,
    }));

    const startLatLng = wps.shift().latLng;
    const endLatLng = wps.pop().latLng;
    const viaPoints = wps.map(wp => L.Util.template('{lng},{lat}', wp.latLng));

    const opt = {
      resource: options.resource,
      start: L.Util.template('{lng},{lat}', startLatLng),
      end: L.Util.template('{lng},{lat}', endLatLng),
      intermediates: viaPoints.join('|'),
      profile: options.profile,
      optimization: options.optimization,
      getSteps: true,
      geometryFormat: 'geojson',
      getBbox: false,
      crs: 'EPSG:4326',
      timeUnit: 'second',
      distanceUnit: 'meter',
      waysAttributes: '',
    };

    return opt;
  },
});

L.Routing.ignGeoservices = function ignGeoservices(options) {
  return new L.Routing.IgnGeoservices(options);
};

module.exports = L.Routing.IgnGeoservices;
