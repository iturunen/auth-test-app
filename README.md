# Charger management app

This is a "hello world" version of an app that incorporates its own OpenID Connect implementation. Currently, it interfaces with Keycloak. However, it's designed in a way that the authentication provider service can be replaced with any service implementing OpenID Connect, such as AWS Cognito.

## Instructions to test the app

Please execute the following steps to be able to play with the app

### Running the app and Keycloak
```
docker compose up -d
```

## Running the App Locally (Optional)
```
npm install
npm run start:dev
```
## Configure Keycloak

1. Go to http://localhost:8080/auth  http://localhost:8080/auth/admin/master/console/#/master/clients (to get there need to login)
2. Click create client
3. Capability config: enable "Client authentication", unselect all from "Authentication flow" but Service accounts roles need to be selected
4. Go to see "Client details" > "Credentials"
5. Copy Client secret

## Obtain JWT from Keycloak Server
Fetch a token using the credentials flow:

curl 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=<client-name>' \
--data-urlencode 'client_secret=<secret-coppied>'

## Query the app with Curl
Copy the token obtained in the previous step and make a query (the port is either 3001 or 3000):

curl 'http://localhost:3001/charger_management/api/charger' \
--header 'Authorization: Bearer <token>'

You can now test the app's authentication by altering the token.

# TODO
- Deploy to AWS using AWS CDK infrastructure.
- Automate Keycloak configuration.
- Integrate an IDP (like Google or Azure AD) and set up automatic configuration with Keycloak.
- Implement unit tests.
- Introduce other authentication flows (e.g., code grant flow) and scopes.
- Determine if all authentication cases have been addressed or if there are other potential improvements.
- Improve proficiency in TypeScript usage :)



