#!/bin/bash
set -euo pipefail

BUCKET_NAME="fighting-prime-media"
REGION="us-east-1"
APP_ORIGINS="http://localhost:3000,https://fightingprime.com"

echo "=== Fighting Prime Media S3 Setup ==="
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
  echo "ERROR: AWS credentials not configured."
  echo "Run 'aws configure' first with your IAM access key and secret."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Using AWS account: $ACCOUNT_ID"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Create bucket (us-east-1 does not use LocationConstraint)
echo "Creating bucket..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket already exists, skipping creation."
else
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
  echo "Bucket created."
fi

# Block all public access
echo "Configuring public access block..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Set CORS for browser uploads
echo "Setting CORS configuration..."
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000", "https://fightingprime.com"],
        "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
        "MaxAgeSeconds": 3600
      }
    ]
  }'

# Enable versioning (protects against accidental deletes)
echo "Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# Lifecycle rule: abort incomplete multipart uploads after 7 days
echo "Setting lifecycle rules..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "AbortIncompleteMultipartUploads",
        "Status": "Enabled",
        "Filter": {},
        "AbortIncompleteMultipartUpload": {
          "DaysAfterInitiation": 7
        }
      }
    ]
  }'

echo ""
echo "=== Setup complete ==="
echo ""
echo "Bucket: s3://$BUCKET_NAME"
echo "Region: $REGION"
echo ""
echo "Next steps:"
echo "  1. Add your AWS credentials to .env.local:"
echo "     AWS_ACCESS_KEY_ID=<your-key>"
echo "     AWS_SECRET_ACCESS_KEY=<your-secret>"
echo "     AWS_S3_BUCKET=$BUCKET_NAME"
echo "     AWS_S3_REGION=$REGION"
echo ""
echo "  2. Test with: aws s3 ls s3://$BUCKET_NAME/"
