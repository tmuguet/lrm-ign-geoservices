(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function() {
  "use strict";

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
  var Gp = (typeof window !== "undefined" ? window['Gp'] : typeof global !== "undefined" ? global['Gp'] : null);

  if (L.Routing === undefined) L.Routing = {};

  L.Routing.GeoPortail = L.Evented.extend({
    options: {
      profile: "Voiture", // Or 'Pieton'
      urlParameters: {}
    },

    initialize: function(apiKey, options) {
      this._apiKey = apiKey;
      L.Util.setOptions(this, options);
    },

    route: function(waypoints, callback, context, options) {
	  var _this = this;

	  var _options = this.options;
	  for (var attrname in options) { _options[attrname] = options[attrname]; }

      var wps = [];
      for (var i = 0; i < waypoints.length; i++) {
        var wp = waypoints[i];
        wps.push({
          latLng: wp.latLng,
          name: wp.name,
          options: wp.options
        });
      }

      var routeOpts = this.buildRouteOpts(wps, _options);
      routeOpts.onSuccess = function(results) {
        _this._handleGeoPortailSuccess(results, wps, callback, context);
      };
      routeOpts.onFailure = function(error) {
        _this._handleGeoPortailError(error, callback, context);
      };

      Gp.Services.route(routeOpts);

      return this;
    },

    _handleGeoPortailSuccess: function(results, wps, callback, context) {
      context = context || callback;

      var coordinates = [];
      var instructions = [];
      for (var i = 0; i < results.routeInstructions.length; i++) {
        var instruction = results.routeInstructions[i];

        instructions.push({
          type: this._instructionToType(instruction),
          text: instruction.instruction,
          distance: instruction.distance,
          time: instruction.duration,
          index: coordinates.length
        });

        for (var j = 0; j < instruction.geometry.coordinates.length; j++) {
          var coords = instruction.geometry.coordinates[j];
          coordinates.push(L.latLng(coords[1], coords[0]));
        }
      }

      var alt = {
        name: "",
        coordinates: coordinates,
        instructions: instructions,
        summary: {
          totalDistance: results.totalDistance,
          totalTime: results.totalTime, //TODO: unit?
          totalAscend: 0 // unsupported?
        },
        inputWaypoints: wps,
        actualWaypoints: [
          {
            latLng: coordinates[0],
            name: wps[0].name
          },
          {
            latLng: coordinates[coordinates.length - 1],
            name: wps[wps.length - 1].name
          }
        ],
        waypointIndices: [0, coordinates.length - 1]
      };

      callback.call(context, null, [alt]);
    },

    _handleGeoPortailError: function(error, callback, context) {
      callback.call(context || callback, {
        status: -1,
        message: "GeoPortail route failed: " + error,
        response: null
      });
    },

    buildRouteOpts: function(waypoints, options) {
		console.log(options);
      var wps = [];
      for (var i = 0; i < waypoints.length; i++) {
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

      for (var i = 0; i < wps.length; i++) {
        var viaPoint = wps[i].latLng;
        viaPoints.push({ x: viaPoint.lng, y: viaPoint.lat });
      }

      var opt = {
        distanceUnit: "m",
        endPoint: {
          x: endLatLng.lng,
          y: endLatLng.lat
        },
        exclusions: [],
        geometryInInstructions: true,
        graph: options.profile,
        routePreferences: "fastest",
        startPoint: {
          x: startLatLng.lng,
          y: startLatLng.lat
        },
        viaPoints: viaPoints,
        apiKey: this._apiKey
      };

      return opt;
    },

    _instructionToType: function(instruction) {
      switch (instruction.code) {
        case "BL":
          return "SharpLeft";
        case "L":
          return "Left";
        case "R":
          return "Right";
        default:
          return "";
      }
    }
  });

  L.Routing.geoPortail = function(apiKey, options) {
    return new L.Routing.GeoPortail(apiKey, options);
  };

  module.exports = L.Routing.GeoPortail;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
