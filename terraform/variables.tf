variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "jesusrugama.demos.basic-langchain"
}

variable "log_group_name" {
  description = "CloudWatch log group name for Bedrock application logs"
  type        = string
  default     = "/aws/bedrock/basic-langchain-demo"
}

variable "vector_bucket_name" {
  description = "The S3 vector bucket name for storing embeddings"
  type        = string
  default     = "jesusrugama.demos.basic-langchain"
}

variable "vector_index_name" {
  description = "The vector index name within the vector bucket"
  type        = string
  default     = "jesusrugama.demos.basic-langchain.index"
}

variable "vector_dimensions" {
  description = "Number of dimensions for vector embeddings (Titan Embeddings uses 1024)"
  type        = number
  default     = 1024
}