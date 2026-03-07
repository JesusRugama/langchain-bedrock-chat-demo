terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      CostCenter  = "demos"
      Project     = "basic-langchain-demo"
      Environment = "demo"
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      CostCenter  = "demos"
      Project     = "basic-langchain-demo"
      Environment = "demo"
      ManagedBy   = "terraform"
    }
  }
}