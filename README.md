# Charger management app

This is helloworld version for app that has own OpenID connect implementation.
Curently it communicates with Keycloak but it is implemented so authentication provider service can be changed to what ever that implements OpenID connect (for example AWS cognito).

## Instructions to test the app

Please execute following steps to be able to play with app

### Running the app and Keycloak
```
docker compose up -d
```

## App can also be executed locally but not necessary
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

## Get jwt from Keycloak server
Get token with credentials flow:

curl 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=<client-name>' \
--data-urlencode 'client_secret=<secret-coppied>'

## Query the app with Curl
Coppy the token fetched in the previous step and query (port is 3001 or 3000):

curl 'http://localhost:3001/charger_management/api/charger' \
--header 'Authorization: Bearer <token>'

Now you can test app authentication by modifying token

# TODO
 - AWS CDK infra to deploy to AWS
 - Auto configure Keycloak
 - Add also some IDP (Google or Azure AD) here and setup autoconfiguration with Keycloak
- Unittests
- Add other auth flows (code grant flow) and scopes
- Learn more if all authentication cases are implemented or othe improvements
- Learn to use Type script properly :)



