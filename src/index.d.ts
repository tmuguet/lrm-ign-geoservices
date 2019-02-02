import * as L from 'leaflet';
import * as Routing from 'leaflet-routing-machine';

declare module 'leaflet' {
  module Routing {
    enum GeoPortailProfile {
      Voiture,
      Pieton,
    }

    interface GeoPortailOptions {
      profile?: GeoPortailProfile;
    }

    class GeoPortail implements IRouter {
      constructor(apiKey: String, options?: GeoPortailOptions);

      route(waypoints: Waypoint[], callback: (args?: any) => void, context?: {}, options?: RoutingOptions): this;

      buildRouteUrl(waypoints: Waypoint[], options: RoutingOptions): Object;
    }
  }
}
