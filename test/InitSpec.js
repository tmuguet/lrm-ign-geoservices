describe('Init', () => {
  let map;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await map.removeAsPromise();
  });

  it('Call to route should give a valid structure', function (done) {
    this.timeout(10000);
    const router = L.Routing.geoPortail('0a6qmo06u1idrw4edhc5iip9', { profile: 'Pieton' });

    router.route(
      [
        L.Routing.waypoint(L.latLng(45.017895798218994, 6.040699481964112)),
        L.Routing.waypoint(L.latLng(45.01489243058454, 6.042029857635499)),
      ],
      (err, result) => {
        try {
          expect(err).to.be.null;
          expect(result).to.be.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('coordinates').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('instructions').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('summary').that.is.an('object').that.is.not.empty;
          expect(result[0]).to.have.property('inputWaypoints').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('actualWaypoints').that.is.an('array').that.is.not.empty;
          expect(result[0]).to.have.property('waypointIndices').that.is.an('array').that.is.not.empty;
          done();
        } catch (e) {
          done(e);
        }
      },
    );
  });
});
