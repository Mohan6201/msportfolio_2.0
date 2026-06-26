export type InfraComponent =
  | "vpc" | "ec2" | "alb" | "rds" | "redis" | "s3" | "cloudfront" | "route53" | "asg" | "waf";

export interface TerraformConfig {
  components: InfraComponent[];
  projectName?: string;
  region?: string;
}

export interface TerraformOutput {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
  asciiDiagram: string;
  estimatedMonthlyMin: number;
  estimatedMonthlyMax: number;
}

const COSTS: Record<InfraComponent, { min: number; max: number }> = {
  vpc:        { min: 0,   max: 5   },
  ec2:        { min: 30,  max: 50  },
  alb:        { min: 20,  max: 30  },
  rds:        { min: 80,  max: 150 },
  redis:      { min: 40,  max: 70  },
  s3:         { min: 2,   max: 10  },
  cloudfront: { min: 5,   max: 25  },
  route53:    { min: 1,   max: 3   },
  asg:        { min: 30,  max: 80  },
  waf:        { min: 10,  max: 20  },
};

const COMPONENT_BLOCKS: Partial<Record<InfraComponent, string>> = {
  vpc: `
# ── VPC ──────────────────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "\${var.project_name}-vpc", Environment = var.environment }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "\${var.project_name}-public-\${count.index}", Tier = "Public" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "\${var.project_name}-private-\${count.index}", Tier = "Private" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "\${var.project_name}-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "\${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

data "aws_availability_zones" "available" { state = "available" }
`,

  ec2: `
# ── EC2 Application Server ───────────────────────────────────────────────────
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_security_group" "ec2" {
  name        = "\${var.project_name}-ec2-sg"
  description = "EC2 application server security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "\${var.project_name}-ec2-sg" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.private[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
  EOF

  tags = { Name = "\${var.project_name}-app", Environment = var.environment }
}
`,

  alb: `
# ── Application Load Balancer ─────────────────────────────────────────────────
resource "aws_security_group" "alb" {
  name        = "\${var.project_name}-alb-sg"
  description = "ALB security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "\${var.project_name}-alb-sg" }
}

resource "aws_lb" "main" {
  name               = "\${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  tags               = { Name = "\${var.project_name}-alb", Environment = var.environment }
}

resource "aws_lb_target_group" "app" {
  name     = "\${var.project_name}-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 5
    interval            = 30
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
`,

  rds: `
# ── RDS PostgreSQL ────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "\${var.project_name}-db-subnets"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "\${var.project_name}-db-subnets" }
}

resource "aws_security_group" "rds" {
  name        = "\${var.project_name}-rds-sg"
  description = "RDS PostgreSQL security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }
  tags = { Name = "\${var.project_name}-rds-sg" }
}

resource "aws_db_instance" "main" {
  identifier              = "\${var.project_name}-db"
  engine                  = "postgres"
  engine_version          = "16.4"
  instance_class          = "db.t3.medium"
  allocated_storage       = 20
  max_allocated_storage   = 100
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  multi_az                = true
  storage_encrypted       = true
  backup_retention_period = 7
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "\${var.project_name}-final-snapshot"
  tags = { Name = "\${var.project_name}-db", Environment = var.environment }
}
`,

  redis: `
# ── ElastiCache Redis ─────────────────────────────────────────────────────────
resource "aws_elasticache_subnet_group" "main" {
  name       = "\${var.project_name}-redis-subnets"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name        = "\${var.project_name}-redis-sg"
  description = "ElastiCache Redis security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }
  tags = { Name = "\${var.project_name}-redis-sg" }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "\${var.project_name}-redis"
  description          = "Redis cache cluster"
  node_type            = var.redis_node_type
  num_cache_clusters   = 2
  automatic_failover_enabled = true
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  tags = { Name = "\${var.project_name}-redis" }
}
`,

  s3: `
# ── S3 Bucket ─────────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "assets" {
  bucket = "\${var.project_name}-assets-\${random_id.suffix.hex}"
  tags   = { Name = "\${var.project_name}-assets", Environment = var.environment }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_id" "suffix" { byte_length = 4 }
`,

  cloudfront: `
# ── CloudFront CDN ────────────────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "\${var.project_name} CDN"
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = { Name = "\${var.project_name}-cdn" }
}

resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "\${var.project_name} OAI"
}
`,

  route53: `
# ── Route53 ───────────────────────────────────────────────────────────────────
resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = "\${var.project_name} hosted zone"
  tags    = { Name = "\${var.project_name}-zone", Environment = var.environment }
}

resource "aws_route53_record" "alb" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
`,

  asg: `
# ── Auto Scaling Group ────────────────────────────────────────────────────────
resource "aws_launch_template" "app" {
  name_prefix   = "\${var.project_name}-lt-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.ec2_instance_type

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.ec2.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "\${var.project_name}-asg-instance", Environment = var.environment }
  }
}

resource "aws_autoscaling_group" "app" {
  name                = "\${var.project_name}-asg"
  desired_capacity    = 2
  min_size            = 1
  max_size            = 6
  vpc_zone_identifier = aws_subnet.private[*].id

  launch_template {
    id      = aws_launch_template.app.id
   version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.app.arn]
  health_check_type = "ELB"

  tag {
    key                 = "Name"
    value               = "\${var.project_name}-asg"
    propagate_at_launch = false
  }
}

resource "aws_autoscaling_policy" "scale_out" {
  name                   = "\${var.project_name}-scale-out"
  autoscaling_group_name = aws_autoscaling_group.app.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 300
}
`,

  waf: `
# ── WAF Web ACL ───────────────────────────────────────────────────────────────
resource "aws_wafv2_web_acl" "main" {
  name  = "\${var.project_name}-waf"
  scope = "REGIONAL"

  default_action { allow {} }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "\${var.project_name}WAFMetric"
    sampled_requests_enabled   = true
  }

  tags = { Name = "\${var.project_name}-waf" }
}

resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
`,
};

function buildVariablesTf(components: InfraComponent[]): string {
  const lines = [
    `variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "myapp"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}`,
  ];

  if (components.includes("ec2") || components.includes("asg")) {
    lines.push(`
variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}`);
  }

  if (components.includes("rds")) {
    lines.push(`
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}`);
  }

  if (components.includes("redis")) {
    lines.push(`
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.medium"
}`);
  }

  if (components.includes("route53")) {
    lines.push(`
variable "domain_name" {
  description = "Root domain name for Route53 hosted zone"
  type        = string
  default     = "example.com"
}`);
  }

  return lines.join("\n");
}

function buildOutputsTf(components: InfraComponent[]): string {
  const outputs: string[] = [];

  if (components.includes("alb")) {
    outputs.push(`output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}`);
  }

  if (components.includes("rds")) {
    outputs.push(`output "db_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}`);
  }

  if (components.includes("redis")) {
    outputs.push(`output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}`);
  }

  if (components.includes("s3")) {
    outputs.push(`output "s3_bucket_name" {
  description = "S3 assets bucket name"
  value       = aws_s3_bucket.assets.bucket
}`);
  }

  if (components.includes("cloudfront")) {
    outputs.push(`output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.main.domain_name
}`);
  }

  if (components.includes("route53")) {
    outputs.push(`output "name_servers" {
  description = "Route53 hosted zone name servers"
  value       = aws_route53_zone.main.name_servers
}`);
  }

  if (components.includes("vpc")) {
    outputs.push(`output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}`);
  }

  return outputs.join("\n\n");
}

function buildAsciiDiagram(components: InfraComponent[]): string {
  const has = (c: InfraComponent) => components.includes(c);
  const lines: string[] = [];

  lines.push("┌─────────────────────── AWS Architecture ───────────────────────────┐");
  lines.push("│                                                                      │");

  if (has("route53")) {
    lines.push("│  [Internet Users]                                                    │");
    lines.push("│       │                                                              │");
    lines.push("│       ▼                                                              │");
    lines.push("│  ┌─────────┐                                                        │");
    lines.push("│  │ Route53 │  (DNS)                                                 │");
    lines.push("│  └────┬────┘                                                        │");
    lines.push("│       │                                                              │");
    lines.push("│       ▼                                                              │");
  }

  if (has("cloudfront")) {
    lines.push("│  ┌──────────────┐                                                   │");
    lines.push("│  │  CloudFront  │  (CDN / Edge Cache)                               │");
    lines.push("│  └──────┬───────┘                                                   │");
    lines.push("│         │                                                            │");
    lines.push("│         ▼                                                            │");
  }

  if (has("waf")) {
    lines.push("│  ┌──────────┐                                                       │");
    lines.push("│  │   WAF    │  (Web Application Firewall)                           │");
    lines.push("│  └────┬─────┘                                                       │");
    lines.push("│       │                                                              │");
    lines.push("│       ▼                                                              │");
  }

  if (has("alb")) {
    lines.push("│  ┌──────────────────────────────────────────────────────────────┐  │");
    lines.push("│  │           Application Load Balancer (ALB)                    │  │");
    lines.push("│  └──────────────────────────┬───────────────────────────────────┘  │");
    lines.push("│                             │                                       │");
    lines.push("│                             ▼                                       │");
  }

  if (has("asg")) {
    lines.push("│  ┌──────────────────────────────────────────────────────────────┐  │");
    lines.push("│  │              Auto Scaling Group                              │  │");
    lines.push("│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │  │");
    lines.push("│  │  │ App EC2  │  │ App EC2  │  │ App EC2  │ (1-6 instances)  │  │");
    lines.push("│  │  └──────────┘  └──────────┘  └──────────┘                  │  │");
    lines.push("│  └───────────────────────┬──────────────────────────────────────┘  │");
  } else if (has("ec2")) {
    lines.push("│  ┌──────────────┐                                                   │");
    lines.push("│  │  EC2 Instance│  (Application Server)                             │");
    lines.push("│  └──────┬───────┘                                                   │");
  }

  const hasData = has("rds") || has("redis");
  if (hasData) {
    lines.push("│                             │                                       │");
    lines.push("│           ┌─────────────────┴─────────────────┐                    │");
    lines.push("│           │                                     │                   │");
    lines.push("│           ▼                                     ▼                   │");

    if (has("rds") && has("redis")) {
      lines.push("│  ┌──────────────────┐            ┌─────────────────────────┐      │");
      lines.push("│  │  RDS PostgreSQL  │            │  ElastiCache Redis      │      │");
      lines.push("│  │  (Multi-AZ)      │            │  (Cache Layer)          │      │");
      lines.push("│  └──────────────────┘            └─────────────────────────┘      │");
    } else if (has("rds")) {
      lines.push("│  ┌───────────────────────────────┐                                │");
      lines.push("│  │  RDS PostgreSQL (Multi-AZ)     │                                │");
      lines.push("│  └───────────────────────────────┘                                │");
    } else if (has("redis")) {
      lines.push("│  ┌───────────────────────────────┐                                │");
      lines.push("│  │  ElastiCache Redis (Cache)     │                                │");
      lines.push("│  └───────────────────────────────┘                                │");
    }
  }

  if (has("s3")) {
    lines.push("│                                                                      │");
    lines.push("│  ┌──────────────────────────────────────────────────────────────┐  │");
    lines.push("│  │  S3 Bucket  (Static Assets / Backups / Logs)                 │  │");
    lines.push("│  └──────────────────────────────────────────────────────────────┘  │");
  }

  lines.push("│                                                                      │");
  lines.push("└─────────────────────────────────────────────────────────────────────┘");

  return lines.join("\n");
}

export function generateTerraform(config: TerraformConfig): TerraformOutput {
  const { components, projectName = "myapp", region = "us-east-1" } = config;

  const header = `# Generated by MS Portfolio — Infrastructure Playground
# Project: ${projectName}  |  Region: ${region}
# Components: ${components.join(", ")}
# Generated: ${new Date().toISOString()}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }${components.includes("s3") ? '\n    random = {\n      source  = "hashicorp/random"\n      version = "~> 3.5"\n    }' : ""}
  }
  required_version = ">= 1.5"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
`;

  const blocks = components
    .filter((c) => COMPONENT_BLOCKS[c])
    .map((c) => COMPONENT_BLOCKS[c]!)
    .join("\n");

  const mainTf = header + blocks;
  const variablesTf = buildVariablesTf(components);
  const outputsTf = buildOutputsTf(components);
  const asciiDiagram = buildAsciiDiagram(components);

  const { min, max } = components.reduce(
    (acc, c) => ({
      min: acc.min + (COSTS[c]?.min ?? 0),
      max: acc.max + (COSTS[c]?.max ?? 0),
    }),
    { min: 0, max: 0 }
  );

  return { mainTf, variablesTf, outputsTf, asciiDiagram, estimatedMonthlyMin: min, estimatedMonthlyMax: max };
}
