import { App } from "@slack/bolt";
import { BuildInfo, Status, SubmitInfo } from "./type";
import { toFileStream } from "qrcode";
import { PassThrough } from "stream";
import { defineSecret, defineString } from "firebase-functions/params";

const SLACK_SIGNING_SECRET = defineSecret("SLACK_SIGNING_SECRET");
const SLACK_BOT_TOKEN = defineSecret("SLACK_BOT_TOKEN");
const SLACK_CHANNEL = defineString("SLACK_CHANNEL");

const bolt = new App({
  signingSecret: SLACK_SIGNING_SECRET.value(),
  token: SLACK_BOT_TOKEN.value(),
});
const channel = SLACK_CHANNEL.value();

/**
 * Post EAS Build results to slack
 * On success, post the URL to the Expo as QR Code
 */
export const postBuildStatusMessage = async (payload: BuildInfo) => {
  const message = createBuildStatusMessage(payload);
  const messageResponse = await bolt.client.chat.postMessage({
    channel,
    ...message,
  });

  // When the Build is finishing, display the Dashboard URL as a QR Code in Slack.
  if (payload.status !== "finished") return;

  // Workaround for writing uploaded files to thead and broadcasting them
  // 1. upload file
  const qrResponse = await bolt.client.files.upload({
    channel,
    ...(await createDashboardQRCodeRequest(payload)),
  });
  const qrResponseTs = qrResponse.file?.shares?.public?.channel_id?.[0]?.ts;

  // 2. delete the message displayed in 1.
  if (qrResponseTs) {
    await bolt.client.chat.delete({
      channel,
      ts: qrResponseTs,
    });
  }

  // 3. post the URL of the file uploaded in 1. to the thread
  if (qrResponse.file?.permalink) {
    await bolt.client.chat.postMessage({
      channel,
      text: `<${qrResponse.file?.permalink}|Expo Dashboard QR Code>`,
      thread_ts: messageResponse.ts,
      reply_broadcast: true,
    });
  }
};

/**
 * Post EAS Submit results to slack
 * On success, post the URL to the Expo as QR Code
 */
export const postSubmitStatusMessage = async (payload: SubmitInfo) => {
  const message = createSubmitStatusMessage(payload);
  await bolt.client.chat.postMessage({
    channel,
    ...message,
  });
};

const createBuildStatusMessage = (payload: BuildInfo) => {
  const {
    buildDetailsPageUrl,
    platform,
    status,
    metadata,
    workerStartedAt,
    completedAt,
  } = payload;

  const statusColor = getStatusColor(status);

  const duration = (() => {
    const diffSec = Math.ceil((new Date(completedAt).getTime() - new Date(workerStartedAt).getTime()) / 1000);
    return `${Math.floor(diffSec/60)}m ${Math.floor(diffSec)%60}s`;
  })();

  const commitMessage = (()=> {
    const repository = process.env.GITHUB_REPOSITORY_URL;
    return repository ?
      `<${repository}/commit/${metadata.gitCommitHash}|${metadata.gitCommitHash.slice(0, 7)} - ${metadata.gitCommitMessage.replace(/\n/g, "")}>` :
      `${metadata.gitCommitHash} - ${metadata.gitCommitMessage}`;
  })();

  return {
    "text": `EAS Build *${status}*`,
    "attachments": [
      {
        "color": statusColor,
        "fields": [
          {
            "title": "Commit message",
            "value": commitMessage,
            "short": false,
          },
          {
            "title": "Platform",
            "value": platform,
            "short": true,
          },
          {
            "title": "Duration",
            "value": duration,
            "short": true,
          },
          {
            "title": "Build Profile",
            "value": metadata.buildProfile,
            "short": true,
          },
          {
            "title": "Version",
            "value": `${metadata.appVersion} (${metadata.appBuildVersion})`,
            "short": true,
          },
          {
            "title": "Details",
            "value": `<${buildDetailsPageUrl}|Expo Dashboard>`,
            "short": true,
          },
        ],
      },
    ],
  };
};

const createDashboardQRCodeRequest = async (payload: BuildInfo) => {
  const { buildDetailsPageUrl } = payload;
  const stream = new PassThrough();
  console.log(toFileStream);
  await toFileStream(stream, buildDetailsPageUrl, {
    type: "png",
  });

  return {
    file: stream,
    title: "Expo Dashboard",
  };
};

const createSubmitStatusMessage = (payload: SubmitInfo) => {
  // see: https://docs.expo.dev/eas/webhooks/#webhook-payload
  const {
    submissionDetailsPageUrl,
    platform,
    status,
  } = payload;

  const statusColor = getStatusColor(status);

  return {
    "text": `EAS Submit *${status}*`,
    "attachments": [
      {
        "color": statusColor,
        "fields": [
          {
            "title": "Platform",
            "value": platform,
            "short": true,
          },
          {
            "title": "Details",
            "value": `<${submissionDetailsPageUrl}|Expo Dashboard>`,
            "short": true,
          },
        ],
      },
    ],
  };
};

const getStatusColor = (status: Status) => {
  switch (status) {
  case "finished":
    return "good";
  case "new":
  case "in-queue":
  case "in-progress":
    return "warning";
  default:
    return "danger";
  }
};
