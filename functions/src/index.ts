import { onRequest } from "firebase-functions/v2/https";
import { BuildInfo, SubmitInfo } from "./type";

export const notifyBuildStatus = onRequest(
  {
    secrets: ["SLACK_SIGNING_SECRET", "SLACK_BOT_TOKEN", "EAS_SECRET_WEBHOOK_KEY"],
  },
  async (request, response) => {
    // Files that depend on secrets are loaded at runtime
    if (!require("./eas").isValidEasRequest(request)) {
      response.status(401).send("Signatures didn't match");
      return;
    }

    const payload = request.body as BuildInfo;
    // Files that depend on secrets are loaded at runtime
    await require("./slack").postBuildStatusMessage(payload);

    response.send("notified");
  });

export const notifySubmitStatus = onRequest(
  {
    secrets: ["SLACK_SIGNING_SECRET", "SLACK_BOT_TOKEN", "EAS_SECRET_WEBHOOK_KEY"],
  },
  (request, response) => {
    if (!require("./eas").isValidEasRequest(request)) {
      response.status(401).send("Signatures didn't match");
      return;
    }

    const payload = request.body as SubmitInfo;
    require("./slack").postSubmitStatusMessage(payload);

    response.send("notified");
  });
