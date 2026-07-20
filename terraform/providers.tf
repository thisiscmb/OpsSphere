provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "OpsSphere"
      Environment = "Dev"
      ManagedBy   = "Terraform"
    }
  }
}