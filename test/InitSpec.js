describe('Init', function () {
  beforeEach(function () {
    this.map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });

    this.xhr = sinon.useFakeXMLHttpRequest();
    this.requests = [];
    this.xhr.onCreate = (req) => {
      this.requests.push(req);
    };
  });

  afterEach(async function () {
    this.xhr.restore();
    sinon.restore();
    await this.map.removeAsPromise();
  });

  it('Call to route should give a valid structure', function (done) {
    this.timeout(10000);
    const router = L.Routing.geoPortail({ profile: 'pedestrian' });

    router.route(
      [
        L.Routing.waypoint(L.latLng(44.9873238680495, 6.07569694519043)),
        L.Routing.waypoint(L.latLng(44.97858169766957, 6.0680580139160165)),
        L.Routing.waypoint(L.latLng(44.97281356376569, 6.069517135620118)),
      ],
      function (err, result) {
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('coordinates').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('instructions').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('summary').that.is.an('object').that.is.not.empty;
          expect(result[0]).to.have.property('inputWaypoints').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('waypoints').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('waypointIndices').that.is.an('array').that.is.not.empty;
          done();
        } catch (e) {
          done(e);
        }
      },
    );
    expect(this.requests.length).to.be.equal(1);
    this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(data_viapoint));
  });
});
