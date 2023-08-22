import { createHmac } from "crypto";
import { Request } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";

const EAS_SECRET_WEBHOOK_KEY = defineSecret("EAS_SECRET_WEBHOOK_KEY");

/**
 * Assertion of signature
 * see: https://docs.expo.dev/eas/webhooks/
 */
export const isValidEasRequest = (request: Request) => {
  const expoSignature = request.headers["expo-signature"] as string|undefined;
  if (!expoSignature) return false;

  const hmac = createHmac("sha1", EAS_SECRET_WEBHOOK_KEY.value());
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  hmac.update(request["rawBody"]);
  const hash = `sha1=${hmac.digest("hex")}`;

  return expoSignature === hash;
};
