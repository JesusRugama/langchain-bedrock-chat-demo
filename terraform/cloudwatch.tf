resource "aws_cloudwatch_log_group" "bedrock_app_logs" {
  name              = var.log_group_name
  retention_in_days = 7

  tags = {
    Application = "basic-langchain-demo"
    Purpose     = "bedrock-invocation-logs"
  }
}
