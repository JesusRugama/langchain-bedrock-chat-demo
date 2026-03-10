# S3 Vector Bucket for storing embeddings
# Note: Native Terraform resources not yet available in AWS provider
# Using null_resource with AWS CLI as interim solution
resource "null_resource" "vector_bucket" {
  provisioner "local-exec" {
    command = <<-EOT
      aws s3vectors create-vector-bucket \
        --vector-bucket-name ${var.vector_bucket_name} \
        --region us-east-1 2>&1 | grep -v "ResourceAlreadyExistsException" || true
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      aws s3vectors delete-vector-bucket \
        --vector-bucket-name ${self.triggers.bucket_name} \
        --region us-east-1 2>&1 || true
    EOT
  }

  triggers = {
    bucket_name = var.vector_bucket_name
  }
}

# Vector Index for similarity search
resource "null_resource" "vector_index" {
  depends_on = [null_resource.vector_bucket]

  provisioner "local-exec" {
    command = <<-EOT
      aws s3vectors create-index \
        --vector-bucket-name ${var.vector_bucket_name} \
        --index-name ${var.vector_index_name} \
        --data-type float32 \
        --dimension ${var.vector_dimensions} \
        --distance-metric cosine \
        --region us-east-1 2>&1 | grep -v "ResourceAlreadyExistsException" || true
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      aws s3vectors delete-index \
        --vector-bucket-name ${self.triggers.bucket_name} \
        --index-name ${self.triggers.index_name} \
        --region us-east-1 2>&1 || true
    EOT
  }

  triggers = {
    bucket_name = var.vector_bucket_name
    index_name  = var.vector_index_name
    dimensions  = var.vector_dimensions
  }
}
