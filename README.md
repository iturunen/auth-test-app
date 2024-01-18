# Authentication app

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

## Obtain JWT from Keycloak Server

1. Configure own client to keycloak or use pre-configured 'isto-test' named client
2. Fetch a token using the credentials flow:
```
curl 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=<client-name>' \
--data-urlencode 'client_secret=<secret-coppied>'
```
## Query the app with Curl
Copy the token obtained in the previous step and make a query (the port is either 3001 or 3000 depending on if the app started with docker or locally):
```
curl 'http://localhost:3001/charger_management/api/charger' \
--header 'Authorization: Bearer <token>'
```
You can now test the app's authentication by altering the token.

## Run tests
```
docker-compose up mysql keycloak -d
npm test
```

# TODO
- Deploy to AWS using AWS CDK infrastructure.
- Automate Keycloak configuration OpenId code grant flow + identity provider adapter + deployment to AWS.
- Introduce other authentication flows (e.g., code grant flow) and scopes.
- Integrate an IDP (like Google or Azure AD) and set up automatic configuration with Keycloak.
- Implement more unit tests, mock keycloak
- Determine if all authentication cases have been addressed or if there are other potential improvements.
- Improve proficiency in TypeScript usage :)
