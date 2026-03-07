variable "log_group_name" {
  description = "CloudWatch log group name for Bedrock application logs"
  type        = string
  default     = "/aws/bedrock/basic-langchain-demo"
}