import request from 'supertest';
import app from './index';

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'password' });
    expect(res.statusCode).toEqual(201);
  });

  it('should login a user', async () => {
    await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'password' });
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password' });
    expect(res.statusCode).toEqual(200);
  });
});
