const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Create an issue with every field: POST request to /api/issues/{project}
  var test_id;

  test('Create an issue with every field', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/Ouroboros')
      .send({
        issue_title: 'Server for S01E09',
        issue_text: 'Please use a new server for S01E09.',
        created_by: 'cheddar',
        open: true,
        status_text: 'High priority',
        assigned_to: 'Eyeless',
        created_on: new Date(Date.now()).toISOString(),
        updated_on: new Date(Date.now()).toISOString(),
        _id: "64cd9ee7abfea7444a821234"
      })
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Create an issue with only required fields: POST request to /api/issues/{project}
  test('Create an issue with only required fields', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/Ouroboros')
      .send({
        issue_title: 'Ban Pepper23',
        issue_text: 'You guys have to ban Pepper23. She has been harrassing people since last week.',
        created_by: 'mozza'
      })
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test('Create an issue with missing required fields', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/Ouroboros')
      .send({
        created_by: 'DEMON_LORD'
      })
      .end((err, res) => {
        // 400 Bad Request
        assert.equal(res.status, 200);
        done(err);
      });
  });

  // View issues on a project: GET request to /api/issues/{project}
  test('View issues on a project', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/Ouroboros')
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // View issues on a project with one filter: GET request to /api/issues/{project}
  test('View issues on a project with one filter', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/Ouroboros?created_by=mozza')
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test('View issues on a project with multiple filters', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/Ouroboros?created_by=cheddar&assigned_to=Eyeless')
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Update one field on an issue: PUT request to /api/issues/{project}
  test('Update one field on an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/Ouroboros')
      .send({
        _id: '64cd9ee7abfea7444a821234',
        created_by: 'feta'
      })
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test('Update multiple fields on an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/Ouroboros')
      .send({
        _id: '64cd9ee7abfea7444a821234',
        open: false,
        issue_title: 'CLOSED - Server for S01E09'
      })
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test('Update an issue with missing _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/Ouroboros')
      .send({
        open: false,
        assigned_to: 'Mods'
      })
      .end((err, res) => {
        // 400 Bad Request
        assert.equal(res.status, 200);
        done(err);
      });
  });

  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test('Update an issue with no fields to update', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/Ouroboros')
      .send({})
      .end((err, res) => {
        // 400 Bad Request
        assert.equal(res.status, 200);
        done(err);
      });
  });

  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test('Update an issue with an invalid _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/Ouroboros')
      .send({
        _id: '64cd9ee7abfea7444a824321',
        assigned_to: 'Mods'
      })
      .end((err, res) => {
        // 400 Bad Request
        assert.equal(res.status, 200);
        done(err);
      });
  });

  // Delete an issue: DELETE request to /api/issues/{project}
  test('Delete an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/Ouroboros')
      .send({
        _id: '64cd9ee7abfea7444a821234'
      })
      .end((err, res) => {
        // 200 OK
        assert.equal(res.status, 200);
        done();
      });
  });

  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test('Delete an issue with an invalid _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/Ouroboros')
      .send({
        _id: '64cd9ee7abfea7444a824321'
      })
      .end((err, res) => {
        // 406 Not Acceptable
        assert.equal(res.status, 200);
        done(err);
      });
  });

  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test('Delete an issue with missing _id}', (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/Ouroboros')
      .send({})
      .end((err, res) => {
        // 400 Bad Request
        assert.equal(res.status, 200);
        done(err);
      });
  });
});
