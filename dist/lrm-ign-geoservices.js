(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = (typeof window !== "undefined" ? window['corslite'] : typeof global !== "undefined" ? global['corslite'] : null);

if (L.Routing === undefined) {
  L.Routing = {};
}

L.Routing.IgnGeoservices = L.Evented.extend({
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
        totalTime: response.duration,
        totalDistance: response.distance
      },
      coordinates: response.geometry.coordinates.map(function (x) {
        return L.latLng(x[1], x[0]);
      }),
      waypoints: this._toWaypoints(response),
      waypointIndices: this._toWaypointsIndices(response),
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
  _isValidStep: function _isValidStep(step) {
    return step.geometry.coordinates.length > 2 || step.geometry.coordinates[0][0] !== step.geometry.coordinates[1][0] || step.geometry.coordinates[0][1] !== step.geometry.coordinates[1][1];
  },
  _toWaypointsIndices: function _toWaypointsIndices(response) {
    var _this2 = this;

    var indices = [0];
    var total = 0;
    response.portions.forEach(function (portion) {
      portion.steps.forEach(function (step) {
        if (_this2._isValidStep(step)) total += step.geometry.coordinates.length - 1;
      });
      indices.push(total);
    });
    return indices;
  },
  _toInstructions: function _toInstructions(response) {
    var _this3 = this;

    var instr = [];
    response.portions.forEach(function (portion) {
      portion.steps.forEach(function (step) {
        if (_this3._isValidStep(step)) {
          var text = '';
          if (step.instruction) text = step.instruction;else {
            if (step.attributes.name.cpx_numero) text = step.attributes.name.cpx_numero;

            if (step.attributes.name.cpx_numero || step.attributes.name.nom_1_gauche || step.attributes.name.nom_1_droite) {
              text += ' ';
            }

            if (step.attributes.name.nom_1_gauche) text += step.attributes.name.nom_1_gauche;else if (step.attributes.name.nom_1_droite) text += step.attributes.name.nom_1_droite;
          }
          instr.push({
            distance: step.distance,
            time: step.duration,
            text: text
          });
        }
      });
    });
    return instr;
  },
  route: function route(waypoints, callback, context) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var timedOut = false;

    var _options = L.extend({}, this.options, options);

    var wps = waypoints.map(function (wp) {
      return {
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      };
    });
    var routeOpts = this.buildRouteOpts(wps, _options);
    var url = _options.serviceUrl + L.Util.getParamString(routeOpts);
    var timer = setTimeout(function () {
      timedOut = true;
      callback.call(context || callback, {
        status: -1,
        message: 'IgnGeoservices request timed out.'
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
            error.message = "Error parsing IgnGeoservices response: ".concat(ex.toString());
          }
        } else {
          error.message = "IgnGeoservices HTTP request failed: ".concat(err.type) + "".concat(err.target && err.target.status ? " HTTP ".concat(err.target.status, ": ").concat(err.target.statusText) : '');
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
    var wps = waypoints.map(function (wp) {
      return {
        latLng: wp.latLng,
        name: wp.name,
        options: wp.options
      };
    });
    var startLatLng = wps.shift().latLng;
    var endLatLng = wps.pop().latLng;
    var viaPoints = wps.map(function (wp) {
      return L.Util.template('{lng},{lat}', wp.latLng);
    });
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

L.Routing.ignGeoservices = function ignGeoservices(options) {
  return new L.Routing.IgnGeoservices(options);
};

module.exports = L.Routing.IgnGeoservices;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
