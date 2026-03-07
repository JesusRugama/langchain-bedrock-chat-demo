# AWS SSO Setup for Bedrock Access

This project uses **AWS SSO temporary credentials** for secure Bedrock authentication.

## Prerequisites

- AWS CLI installed (`aws --version`)
- AWS SSO configured in your organization
- Bedrock access enabled in your AWS account

## Setup Steps

### 1. Configure AWS SSO Profile

If you haven't already, configure your SSO profile:

```bash
aws configure sso
```

Follow the prompts:

- **SSO session name**: (e.g., `my-sso`)
- **SSO start URL**: Your organization's SSO portal URL
- **SSO region**: Your SSO region (e.g., `us-east-1`)
- **SSO registration scopes**: `sso:account:access`
- **CLI default client Region**: Region where Bedrock is available (e.g., `us-east-1`)
- **CLI default output format**: `json`
- **CLI profile name**: (e.g., `bedrock-dev`)

### 2. Login via SSO

Authenticate and get temporary credentials:

```bash
aws sso login --profile bedrock-dev
```

This will:

- Open your browser for SSO authentication
- Cache temporary credentials in `~/.aws/sso/cache/`
- Credentials are valid for the session duration (typically 8-12 hours)

### 3. Set Environment Variable (Optional)

If you're using a non-default profile, set:

```bash
export AWS_PROFILE=bedrock-dev
```

Or add to your `.env` file:

```env
AWS_PROFILE=bedrock-dev
AWS_REGION=us-east-1
```

### 4. Verify Access

Test Bedrock access:

```bash
aws bedrock list-foundation-models --region us-east-1 --profile bedrock-dev
```

## How It Works

The AWS SDK (used by `@langchain/aws`) automatically:

1. Detects SSO credentials from `~/.aws/config`
2. Retrieves cached temporary credentials from `~/.aws/sso/cache/`
3. Refreshes credentials when they expire (requires re-login)

## Credential Refresh

When credentials expire, you'll see an error. Simply run:

```bash
aws sso login --profile bedrock-dev
```

## Security Benefits

- ✅ No long-lived access keys in `.env` files
- ✅ Automatic credential rotation
- ✅ Centralized access management via SSO
- ✅ Audit trail through CloudTrail
- ✅ MFA enforcement (if configured)

## Troubleshooting

### "Unable to locate credentials"

Run `aws sso login --profile <your-profile>` to refresh credentials.

### "Token has expired"

SSO session expired. Re-authenticate with `aws sso login`.

### "Access Denied" for Bedrock

Ensure your SSO role has the required Bedrock permissions:

- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`
