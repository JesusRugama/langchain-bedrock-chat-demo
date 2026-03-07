output "log_group_name" {
  description = "CloudWatch log group name for Bedrock logs"
  value       = aws_cloudwatch_log_group.bedrock_app_logs.name
}

output "log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.bedrock_app_logs.arn
}
