import supertest from 'supertest';
import app from '../index';

const request = supertest(app);

describe('Check server GET:/', () => {
  it('Check server is up and running', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toEqual(JSON.stringify({ message: 'Server is Up!' }));
  });
});

describe('Check GET:/api/images', () => {
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

describe('Check POST:/api/images/upload', () => {
  const validFilePath = `${__dirname}/files/pollock.jpg`;
  const invavalidImageFilePath = `${__dirname}/files/file_example.tiff`;
  const invalidPDFFIlePath = `${__dirname}/files/sample.pdf`;
  // const validListFilePath = [
  //   `${__dirname}/files/pollock.jpg`,
  //   `${__dirname}/files/wassily - kandinsky.jpg`
  // ];
  it('Upload a valid image file', async () => {
    const response = await request
      .post('/api/images/upload')
      .attach('files', validFilePath);
    expect(response.status).toBe(200);
    expect(response.text).toEqual(
      JSON.stringify({
        message: ['pollock.jpg']
      })
    );
  });
  // it('Upload a list of valid image files', async () => {
  //   const requestPOST = request.post('/api/images/upload');
  //   for (const file of validListFilePath) {
  //     requestPOST.attach('files', file);
  //   }
  //   const response = await requestPOST;
  //   expect(response.status).toBe(200);
  //   expect(response.text).toContain('message');
  // });
  it('Upload a invalid image file', async () => {
    const response = await request
      .post('/api/images/upload')
      .attach('files', invavalidImageFilePath);
    expect(response.status).toBe(400);
    expect(response.text).toEqual(
      JSON.stringify({ message: 'Only .png, .jpg and .jpeg format allowed!' })
    );
  });
  it('Upload a invalid pdf file', async () => {
    const response = await request
      .post('/api/images/upload')
      .attach('files', invalidPDFFIlePath);
    expect(response.status).toBe(400);
    expect(response.text).toEqual(
      JSON.stringify({ message: 'Only .png, .jpg and .jpeg format allowed!' })
    );
  });
});
