terraform {
  backend "s3" {
    bucket         = "jesusrugama.terraform"
    key            = "jesusrugama-infrastructure/demos/basic-langchain-demo/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "jesusrugama.terraform-locks"
    encrypt        = true
  }
}