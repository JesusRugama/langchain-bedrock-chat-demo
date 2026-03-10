# S3 bucket for source documents (what you'll upload to)
resource "aws_s3_bucket" "knowledge_source" {
  bucket = "${var.project_name}.source"
}

resource "aws_s3_bucket_versioning" "knowledge_source" {
  bucket = aws_s3_bucket.knowledge_source.id
  versioning_configuration {
    status = "Enabled"
  }
}
