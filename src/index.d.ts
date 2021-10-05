import * as L from 'leaflet';
import * as Routing from 'leaflet-routing-machine';

declare module 'leaflet' {
  module Routing {
    enum GeoPortailResource {
      'bdtopo-osrm',
      'bdtopo-pgr',
    }
    enum GeoPortailProfile {
      'car',
      'pedestrian',
    }
    enum GeoPortailOptimization {
      'fastest',
      'shortest'
    }

    interface GeoPortailOptions {
      serviceUrl?: String,
      timeout?: Number,
      resource?: GeoPortailResource,
      profile?: GeoPortailProfile,
      optimization?: GeoPortailOptimization,
    }

    class GeoPortail implements IRouter {
      constructor(options?: GeoPortailOptions);

      route(waypoints: Waypoint[], callback: (args?: any) => void, context?: {}, options?: GeoPortailOptions): this;

      buildRouteOpts(waypoints: Waypoint[], options: GeoPortailOptions): Object;
    }
  }
}
