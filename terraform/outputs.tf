output "vpc_id" {
  value = data.aws_vpc.default.id
}

output "subnets" {
  value = data.aws_subnets.default.ids
}
output "frontend_repository_url" {
  value = module.ecr.frontend_repository_url
}

output "backend_repository_url" {
  value = module.ecr.backend_repository_url
}
output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}