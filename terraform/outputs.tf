output "log_group_name" {
  description = "CloudWatch log group name for Bedrock logs"
  value       = aws_cloudwatch_log_group.bedrock_app_logs.name
}

output "log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.bedrock_app_logs.arn
}

output "vector_bucket_name" {
  description = "S3 Vector bucket name for embeddings"
  value       = var.vector_bucket_name
}

output "vector_index_name" {
  description = "Vector index name within the bucket"
  value       = var.vector_index_name
}

output "vector_dimensions" {
  description = "Vector embedding dimensions"
  value       = var.vector_dimensions
}

# output "knowledge_base_id" {
#   description = "Knowledge Base ID for querying"
#   value       = aws_bedrockagent_knowledge_base.main.id
# }
#
# output "knowledge_base_arn" {
#   description = "Knowledge Base ARN"
#   value       = aws_bedrockagent_knowledge_base.main.arn
# }
#
# output "knowledge_source_bucket" {
#   description = "S3 bucket name for uploading source documents"
#   value       = aws_s3_bucket.knowledge_source.bucket
# }
#
# output "data_source_id" {
#   description = "Data source ID for syncing documents"
#   value       = aws_bedrockagent_data_source.s3_source.data_source_id
# }
