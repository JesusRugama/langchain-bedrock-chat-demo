# IAM role for Knowledge Base
resource "aws_iam_role" "knowledge_base" {
  name = "${replace(var.project_name, ".", "-")}-bedrock-kb-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
          ArnLike = {
            // Only KB can asume this role.
            "aws:SourceArn" = "arn:aws:bedrock:us-east-1:${data.aws_caller_identity.current.account_id}:knowledge-base/*"
          }
        }
      }
    ]
  })
}

# Policy for Knowledge Base to access S3 source bucket
resource "aws_iam_role_policy" "knowledge_base_s3" {
  name = "${var.project_name}.kb-s3-policy"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.knowledge_source.arn,
          "${aws_s3_bucket.knowledge_source.arn}/*"
        ]
      }
    ]
  })
}

# Policy for Knowledge Base to use Bedrock models
resource "aws_iam_role_policy" "knowledge_base_bedrock" {
  name = "${var.project_name}.kb-bedrock-policy"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = [
          "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0"
        ]
      }
    ]
  })
}

# Policy for Knowledge Base to access S3 Vectors
resource "aws_iam_role_policy" "knowledge_base_s3vectors" {
  name = "${var.project_name}.kb-s3vectors-policy"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3vectors:PutVectors",
          "s3vectors:GetVectors",
          "s3vectors:DeleteVectors",
          "s3vectors:Query",
          "s3vectors:QueryVectors",
          "s3vectors:DescribeIndex",
          "s3vectors:ListIndexes"
        ]
        Resource = [
          "arn:aws:s3vectors:us-east-1:${data.aws_caller_identity.current.account_id}:bucket/${var.vector_bucket_name}",
          "arn:aws:s3vectors:us-east-1:${data.aws_caller_identity.current.account_id}:bucket/${var.vector_bucket_name}/*",
          "arn:aws:s3vectors:us-east-1:${data.aws_caller_identity.current.account_id}:bucket/${var.vector_bucket_name}/index/${var.vector_index_name}"
        ]
      }
    ]
  })
}

# Knowledge Base resource
resource "aws_bedrockagent_knowledge_base" "main" {
  name     = "${replace(var.project_name, ".", "-")}-kb"
  role_arn = aws_iam_role.knowledge_base.arn

  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0"
    }
    type = "VECTOR"
  }

  storage_configuration {
    type = "S3_VECTORS"

    s3_vectors_configuration {
      index_arn = "arn:aws:s3vectors:us-east-1:${data.aws_caller_identity.current.account_id}:bucket/${var.vector_bucket_name}/index/${var.vector_index_name}"
    }
  }

  depends_on = [
    null_resource.vector_bucket,
    null_resource.vector_index,
    aws_iam_role_policy.knowledge_base_s3,
    aws_iam_role_policy.knowledge_base_bedrock,
    aws_iam_role_policy.knowledge_base_s3vectors
  ]
}

# Data source for S3 bucket
resource "aws_bedrockagent_data_source" "s3_source" {
  knowledge_base_id = aws_bedrockagent_knowledge_base.main.id
  name              = "${replace(var.project_name, ".", "-")}-source"

  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = aws_s3_bucket.knowledge_source.arn
    }
  }

  vector_ingestion_configuration {
    chunking_configuration {
      chunking_strategy = "FIXED_SIZE"
      fixed_size_chunking_configuration {
        max_tokens         = 300
        overlap_percentage = 20
      }
    }
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}