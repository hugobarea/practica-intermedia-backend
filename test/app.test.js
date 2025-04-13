const request = require('supertest');
const { app, server } = require('../index.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js');
const { userModel } = require('../models');
const { tokenSign, verifyToken } = require('../utils/handleJwt.js');
require('dotenv').config();

let token = ""; // token jwt

beforeAll(async () => {
  //await dbConnect(); No es necesario ya que se llama en el index
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe('User Endpoints', () => {
  const testUser = {
    email: `test_jest@test.com`,
    password: '12345678'
  };

  it('POST /api/user/register - should register a user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    token = res.body.token;
  });

  it('POST /api/user/login - should fail login (email is not validated)', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send(testUser);
    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/user/validation - should fail with wrong code', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });
    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/user/validation - should succeed with valid code', async () => {
    const dataToken = await verifyToken(token);
    const { code } = await userModel.findById(dataToken._id).select("code");
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: code });
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/user/login - should login successfully (email is now validated)', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send(testUser);
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/user/validation - should fail recovery code validation', async () => {
    const res = await request(app)
      .post('/api/user/validation')
      .send({ email: testUser.email, code: '000000' });
    expect([400, 404]).toContain(res.statusCode);
  });

  it('GET /api/user - should be unauthorized without token', async () => {
    const res = await request(app).get('/api/user');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/user - should succeed if sent with correct token', async () => {
    const res = await request(app)
    .get('/api/user')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('PUT /api/user/register - should update user info', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', surnames: 'User', nif: '12345678Z' });
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/user/recover - should set recover code', async () => {
    const res = await request(app)
      .post('/api/user/recover')
      .send({ email: testUser.email });
    expect([200, 404]).toContain(res.statusCode);
  });

  it('PATCH /api/user/password - should fail without valid token', async () => {
    const res = await request(app)
      .patch('/api/user/password')
      .send({ password: 'newpassword123' });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/user/company - should update company info', async () => {
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        "company": {
          "name": "Servitop, SL.",
          "cif": "BXXXXXXXX",
          "number": 22,
          "street": "Carlos V",
          "postal": 28936,
          "city": "Móstoles",
          "province": "Madrid"
        }
      });
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/user/invite - should invite guest user', async () => {
    const res = await request(app)
      .post('/api/user/invite')
      .send({
        "name": "Manuel",
        "surnames": "Pérez Gómez",
        "email": "guest4@gmail.com",
        "company": {
          "name": "Servitop, SL.",
          "cif": "BXXXXXXXX",
          "street": "Carlos V",
          "number": 22,
          "postal": 28936,
          "city": "Móstoles",
          "province": "Madrid"
        }
      });
    expect([200, 409]).toContain(res.statusCode);
  });

  it('DELETE /api/user - should soft delete user', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
  });

  it('DELETE /api/user - should hard delete user', async () => {
    const res = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
