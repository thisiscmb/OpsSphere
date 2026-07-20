variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-south-2"
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "opssphere-eks"
}

variable "vpc_id" {
  description = "Existing Default VPC"
  type        = string
  default     = "vpc-00fd5627930f51e18"
}