import * as L from 'leaflet';
import * as Routing from 'leaflet-routing-machine';

declare module 'leaflet' {
  module Routing {
    enum IgnGeoservicesResource {
      'bdtopo-osrm',
      'bdtopo-pgr',
    }
    enum IgnGeoservicesProfile {
      'car',
      'pedestrian',
    }
    enum IgnGeoservicesOptimization {
      'fastest',
      'shortest'
    }

    interface IgnGeoservicesOptions {
      serviceUrl?: String,
      timeout?: Number,
      resource?: IgnGeoservicesResource,
      profile?: IgnGeoservicesProfile,
      optimization?: IgnGeoservicesOptimization,
    }

    class IgnGeoservices implements IRouter {
      constructor(options?: IgnGeoservicesOptions);

      route(waypoints: Waypoint[], callback: (args?: any) => void, context?: {}, options?: RoutingOptions): this;

      buildRouteOpts(waypoints: Waypoint[], options: IgnGeoservicesOptions): Object;
    }
  }
}
