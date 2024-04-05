## Developing Locally

> [!WARNING]
> **You can't use the CLI locally unless you have Ecom-Connect [running locally](https://github.com/squareup/go-square/tree/master/ecom-connect#local-testing--development) as well!**

Development ENV Variables:
```
PREVIEW_HOST=https://staging.weebly.net // for staging or use your local weld host https://${ldap}.development.weebly.net
API_HOST=https://connect.squareupstaging.com // for staging or http://127.0.0.1:12358 for local ecom-connect depending on where it is serving. 
```

When testing against weld hybrid / staging sites use the accesstoken from developer.squareupstaging.com in the auth command. Can be personal access token or OAuth token.
```
./bin/dev.js auth {accessToken}
```

> [!NOTE]
> Running `dev.js` requires `ts-node`. Install globally via `npm install -g ts-node`


When testing with ecom-connect running locally, modify the access token as follows, substituting the `${merchantToken}` with the merchant token of the site you are targeting. More info on ecom-connect here https://github.com/squareup/go-square/tree/master/ecom-connect

```
./bin/dev.js auth ::${merchantToken}: --skipPermissionsCheck
```

Use the `./bin/dev.js` to run the commands while developing the CLI.

```
./bin/dev.js COMMAND ARGS --flag
```
