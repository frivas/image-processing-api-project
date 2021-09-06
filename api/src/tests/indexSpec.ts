import supertest from 'supertest';
import app from '../index';

const request = supertest(app);

describe('Check server endpoints', () => {
  it('Check server is up and running', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toEqual('Server is Up!');
  });
});

describe('Check /api/images endpoints', () => {
  it('Check all parameters of the query are missing', async () => {
    const response = await request.get('/api/images');
    expect(response.status).toBe(400);
  });
  it('Check filename of the query are missing', async () => {
    const response = await request.get('/api/images?width=200&height=200');
    expect(response.status).toBe(400);
  });
  it('Check width of the query are missing', async () => {
    const response = await request.get(
      '/api/images?filename=mountfuji&height=200'
    );
    expect(response.status).toBe(200);
  });
  it('Check height of the query are missing', async () => {
    const response = await request.get(
      '/api/images?filename=mountfuji&width=200'
    );
    expect(response.status).toBe(200);
  });
  it('Check correct answer when the file specified does not exist', async () => {
    const response = await request.get(
      '/api/images?filename=argentina&width=200'
    );
    expect(response.status).toBe(400);
  });
  it('Check correct answer when the filename partially matches an existent one', async () => {
    const response = await request.get('/api/images?filename=mount&width=200');
    expect(response.status).toBe(400);
  });
});
