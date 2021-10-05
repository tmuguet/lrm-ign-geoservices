(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = (typeof window !== "undefined" ? window['corslite'] : typeof global !== "undefined" ? global['corslite'] : null);

if (L.Routing === undefined) {
  L.Routing = {};
}

L.Routing.GeoPortail = L.Evented.extend({
  options: {
    serviceUrl: 'https://wxs.ign.fr/calcul/geoportail/itineraire/rest/1.0.0/route',
    timeout: 10 * 1000,
    resource: 'bdtopo-osrm',
    // or 'bdtopo-pgr'
    profile: 'car',
    // Or 'pedestrian'
    optimization: 'fastest' // or shortest

  },
  initialize: function initialize(options) {
    L.Util.setOptions(this, options);
  },
  _routeDone: function _routeDone(response, inputWaypoints, options, callback, context) {
    var alts = [];
    var route = {
      name: '',
      summary: {
        totalTime: response.duration * 60,
        totalDistance: response.distance
      },
      coordinates: response.geometry.coordinates.map(function (x) {
        return L.latLng(x[1], x[0]);
      }),
      waypoints: this._toWaypoints(response),
      waypointIndices: [0, response.geometry.coordinates.length - 1],
      inputWaypoints: inputWaypoints,
      instructions: this._toInstructions(response)
    };
    alts.push(route);
    callback.call(context, null, alts);
  },
  _toWaypoint: function _toWaypoint(str) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var latlng = str.split(',');
    return new L.Routing.Waypoint(L.latLng(parseFloat(latlng[1]), parseFloat(latlng[0])), name, options);
  },
  _toWaypoints: function _toWaypoints(response) {
    var _this = this;

    var wps = [this._toWaypoint(response.portions[0].start)];
    response.portions.forEach(function (x) {
      wps.push(_this._toWaypoint(x.end));
    });
    return wps;
  },
  _toInstructions: function _toInstructions(response) {
    var instr = [];
    response.portions.forEach(function (portion) {
      portion.steps.forEach(function (step) {
        instr.push({
          distance: step.distance,
          time: step.duration,
          text: step.instruction || step.attributes.name.cpx_numero + (step.attributes.name.nom_1_gauche || step.attributes.name.nom_1_droite)
        });
      });
    });
    return instr;
  },
  route: function route(waypoints, callback, context) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var timedOut = false;

    var _options = L.extend({}, this.options, options);

    var wps = [];

    for (var i = 0; i < waypoints.length; i += 1) {
      var wp = waypoints[i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      });
    }

    var routeOpts = this.buildRouteOpts(wps, _options);
    var url = _options.serviceUrl + L.Util.getParamString(routeOpts);
    var timer = setTimeout(function () {
      timedOut = true;
      callback.call(context || callback, {
        status: -1,
        message: 'OSRM request timed out.'
      });
    }, _options.timeout); // eslint-disable-next-line func-names

    var xhr = corslite(url, L.bind(function (err, resp) {
      var error = {};
      clearTimeout(timer);

      if (!timedOut) {
        if (!err) {
          try {
            try {
              var data = JSON.parse(resp.responseText);

              this._routeDone(data, wps, options, callback, context);

              return;
            } catch (ex) {
              error.status = -3;
              error.message = ex.toString();
            }
          } catch (ex) {
            error.status = -2;
            error.message = "Error parsing OSRM response: ".concat(ex.toString());
          }
        } else {
          error.message = "HTTP request failed: ".concat(err.type).concat(err.target && err.target.status ? " HTTP ".concat(err.target.status, ": ").concat(err.target.statusText) : '');
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
  buildRouteOpts: function buildRouteOpts(waypoints, options) {
    var wps = [];
    var i;

    for (i = 0; i < waypoints.length; i += 1) {
      var wp = waypoints[i];
      wps.push({
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      });
    }

    var startLatLng = wps.shift().latLng;
    var endLatLng = wps.pop().latLng;
    var viaPoints = [];

    for (i = 0; i < wps.length; i += 1) {
      var viaPoint = wps[i].latLng;
      viaPoints.push(L.Util.template('{lng},{lat}', viaPoint));
    }

    var opt = {
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
      waysAttributes: ''
    };
    return opt;
  }
});

L.Routing.geoPortail = function geoPortail(options) {
  return new L.Routing.GeoPortail(options);
};

module.exports = L.Routing.GeoPortail;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
