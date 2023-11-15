import axios from 'axios';
import dotenv from 'dotenv';
import request from 'supertest';

// this need to be before the import of app
dotenv.config();

import { initializeServer } from '../src/test-server';


const keycloakServer = process.env.AUTH_TOKEN_URL ?? 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token';
const clientId = process.env.CLIENT_ID ?? 'isto-test';
const clientSecret = process.env.CLIENT_SECRET ?? 'isto-test-client-secret';
const appEndpoint = 'http://localhost:3000/charger_management/api/charger';

let server;
console.log(process.env);
beforeAll(() => {
  server = initializeServer();
});

afterAll(() => {
  // Close the server after all tests are done
  server.close();
});

describe('/health route', () => {

  // afterAll(async () => {
  //   await close();
  // });

  test('Should respond OK', async () => {
    await request(server).get('/charger_management/health').expect(200);
  });
});

describe('Keycloak Authentication Test', () => {
  it('should authenticate with Keycloak and access the app', async () => {
    const tokenResponse = await axios.post(keycloakServer, new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = tokenResponse.data.access_token;
    // Check if the token is not null
    expect(token).not.toBeNull();

    const appResponse = await axios.get(appEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(appResponse.status).toBe(200);


    // call the app endpoint with the token
    //const appResponse = await request(server)
      // .get(appEndpoint)
      // .set('Authorization', `Bearer ${token}`);

    // Check if the response status is 200 (OK)
    expect(appResponse.status).toBe(200);
  });


});