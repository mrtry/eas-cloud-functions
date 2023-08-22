/**
 * see: https://docs.expo.dev/eas/webhooks/#webhook-payload
 */

interface Artifact {
  buildUrl: string;
  logsS3KeyPrefix: string;
}

interface TrackingContext {
  platform: string;
  account_id: string;
  dev_client: boolean;
  project_id: string;
  tracking_id: string;
  project_type: string;
  dev_client_version: string;
}

interface Metrics {
  memory: number;
  buildEndTimestamp: number;
  totalDiskReadBytes: number;
  buildStartTimestamp: number;
  totalDiskWriteBytes: number;
  cpuActiveMilliseconds: number;
  buildEnqueuedTimestamp: number;
  totalNetworkEgressBytes: number;
  totalNetworkIngressBytes: number;
}

interface ErrorInfo {
  message: string;
  errorCode: string;
}

interface Metadata {
  appName: string;
  username: string;
  workflow: string;
  appVersion: string;
  appBuildVersion: string;
  cliVersion: string;
  sdkVersion: string;
  buildProfile: string;
  distribution: string;
  appIdentifier: string;
  gitCommitHash: string;
  gitCommitMessage: string;
  runtimeVersion: string;
  channel: string;
  releaseChannel: string;
  reactNativeVersion: string;
  trackingContext: TrackingContext;
  credentialsSource: string;
  isGitWorkingTreeDirty: boolean;
  message: string;
  runFromCI: boolean;
}

export interface BuildInfo {
  id: string;
  accountName: string;
  projectName: string;
  buildDetailsPageUrl: string;
  parentBuildId: string | null;
  appId: string;
  initiatingUserId: string;
  cancelingUserId: string | null;
  platform: "android" | "ios";
  status: Status;
  artifacts: Artifact;
  metadata: Metadata;
  metrics: Metrics;
  error: ErrorInfo | null;
  createdAt: string;
  enqueuedAt: string;
  provisioningStartedAt: string;
  workerStartedAt: string;
  completedAt: string;
  updatedAt: string;
  expirationDate: string;
  priority: string;
  resourceClass: string;
  actualResourceClass: string;
  maxRetryTimeMinutes: number;
}

interface ErrorInfo {
  message: string;
  errorCode: string;
}

interface SubmissionInfo {
  error: ErrorInfo;
  logsUrl: string;
}

export interface SubmitInfo {
  id: string;
  accountName: string;
  projectName: string;
  submissionDetailsPageUrl: string;
  parentSubmissionId: string | null;
  appId: string;
  archiveUrl: string;
  initiatingUserId: string;
  cancelingUserId: string | null;
  turtleBuildId: string | null;
  platform: "android" | "ios";
  status: Status;
  submissionInfo?: SubmissionInfo;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  maxRetryTimeMinutes: number;
}

// see: https://github.com/expo/eas-cli/blob/main/packages/eas-cli/src/build/types.ts
export type Status = "new" | "in-queue" | "in-progress" | "pending-cancel" | "finished" | "errored" | "canceled";
