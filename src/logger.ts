import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

interface MessageContent {
  role: string;
  content: string;
}

interface BedrockLogEntry {
  timestamp: number;
  model: string;
  messageCount: number;
  messages?: MessageContent[];
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  error?: string;
}

export class BedrockLogger {
  private client: CloudWatchLogsClient;
  private logGroupName: string;
  private logStreamName: string;
  private sequenceToken?: string;

  constructor(region: string, logGroupName: string) {
    this.client = new CloudWatchLogsClient({ region });
    this.logGroupName = logGroupName;
    this.logStreamName = `app-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  async initialize(): Promise<void> {
    try {
      await this.client.send(
        new CreateLogStreamCommand({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
        })
      );
    } catch (error: any) {
      if (error.name !== "ResourceAlreadyExistsException") {
        console.warn("Failed to create log stream:", error.message);
      }
    }
  }

  async logInvocation(entry: BedrockLogEntry): Promise<void> {
    try {
      const message = JSON.stringify({
        ...entry,
        timestamp: new Date(entry.timestamp).toISOString(),
      });

      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [
          {
            message,
            timestamp: entry.timestamp,
          },
        ],
        sequenceToken: this.sequenceToken,
      });

      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;
    } catch (error: any) {
      console.warn("Failed to log to CloudWatch:", error.message);
    }
  }
}
