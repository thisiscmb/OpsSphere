data "aws_vpc" "default" {
  id = var.vpc_id
}

data "aws_subnets" "default" {

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}
module "iam" {
  source = "./modules/iam"

  cluster_name = var.cluster_name
}
module "ecr" {
  source = "./modules/ecr"

  project_name = "opssphere"
}
module "eks" {
  source = "./modules/eks"

  cluster_name = var.cluster_name
  vpc_id        = data.aws_vpc.default.id
  subnet_ids    = data.aws_subnets.default.ids

  depends_on = [
    module.iam
  ]
}