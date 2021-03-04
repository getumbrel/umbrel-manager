/* globals requester */

describe('ping', () => {
  it('should respond on /ping GET', done => {
    requester
      .get('/ping')
      .end((error, res) => {
        if (error) {
          done(error);
        }

        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('version');
        done();
      });
  });
});
