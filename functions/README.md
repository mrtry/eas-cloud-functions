# EAS Slack Notifier

Firebase Cloud Functions to notify Slack of EAS (Build|Submit) results.

# Screenshot

| Success  |  Failed  |   Cancel   | 
|:--------:|:--------:|:----------:|
| <img width="500" alt="スクリーンショット 2023-08-24 18 34 47" src="https://github.com/mrtry/eas-cloud-functions/assets/8851552/c7bb3c9f-b3d6-4805-903c-8675c68edd93"> | <img width="498" alt="スクリーンショット 2023-08-24 18 35 12" src="https://github.com/mrtry/eas-cloud-functions/assets/8851552/1636d101-f8cf-4598-8454-458a90f5c573"> | <img width="500" alt="スクリーンショット 2023-08-24 18 35 29" src="https://github.com/mrtry/eas-cloud-functions/assets/8851552/73de580a-4e61-41ce-aabd-fc5488f79ac5"> |

# Setup

## Slack

Create a Slack App
[Bolt's Getting Started](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started) and others are helpful.

- Set `chat:write` `files:write` in Scope.
- Memo the `Bot Token` `Signing Secret` as you will use it later.


## Firebase Cloud Functions

Set up Secrets
Refer to [Firebase documentation](https://firebase.google.com/docs/functions/config-env&gen=2nd#secret-manager)

```shell
$ firebase functions:secrets:set SLACK_BOT_TOKEN
$ firebase functions:secrets:set SLACK_SIGNING_SECRET
$ firebase functions:secrets:set EAS_SECRET_WEBHOOK_KEY
```

| key                    | description                                                                |
|:-----------------------|:---------------------------------------------------------------------------|
| SLACK_BOT_TOKEN        | Slack's Bot Token                                                          |
| SLACK_SIGNING_SECRET   | Slack's Signing Secret                                                     |
| EAS_SECRET_WEBHOOK_KEY | Secret to be set in [Expo's Webhooks](https://docs.expo.dev/eas/webhooks/) |

Set environment variables.
Edit `.env`.

| key                   | description                                                                                                                           |
|:----------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| SLACK_CHANNEL         | Specify the Slack Channel name or Channel ID for which you want to post notifications                                                 | 
| GITHUB_REPOSITORY_URL | (Optional) Specify the GitHub Repository where the app's codebase is located. Link will set the `Commit message` in the notification. |

Once you have set up everything, Deploy

```shell
$ yarn install
$ yarn deploy
```

You will need to set up permissions so that you can call the deployed Functions from Expo.
The Cloud Run Console lists up the Deployed Functions, so configure each function so that it can be called by unauthorized users.
Refer to [CGP documentation](https://cloud.google.com/run/docs/authenticating/public).

![スクリーンショット 2023-08-24 9 21 47](https://github.com/mrtry/eas-cloud-functions/assets/8851552/59d35862-389c-4170-9316-b85573fd21b8)

### Tips

- When deploying, an error may occur due to insufficient privileges.
- When you update privileges, `$ firebase login --reauth` to update the account status.


## Expo Webhooks

Setup [Webhooks](https://docs.expo.dev/eas/webhooks/).

- Run `$ eas webhook:create`.
  - Specify `EAS_SECRET_WEBHOOK_KEY` for secret.

# Debug

Run the application with the following command

```shell
$ yarn build:watch # Watch for changes in TypeScript and transpile to JS if any changes are made.
$ yarn start:emulator # Run Firebase Cloud Functions locally.
```

Once the application is up and running, you can debug it by sending a request to the local server

Under `request-sample`, there is a json that mimics an EAS (Build|Submit) request.
This makes it easy to test locally

Example using [httpie](https://httpie.io/docs/cli)

```shell
http -v POST http://127.0.0.1:5001/project-xxxxxx/us-central1/notifyBuildStatus < request-samples/build-success.json
```

When debugging, you need to adjust the assertion to pass as follows
- Make sure `isValidEasRequest()` always returns true.
- set `expo-signature` in `header
    - ex `http -v POST http://127.0.0.1:5001/project-xxxxxx/us-central1/notifyBuildStatus expo-signature:sha1=xxxxxxxxxxxxx < request-samples/ build-success.json`.
