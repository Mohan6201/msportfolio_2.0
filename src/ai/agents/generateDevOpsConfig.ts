import { generateObject } from "ai";
import { z } from "zod";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import { withFallback } from "@/ai/lib/withFallback";

const architectureSchema = z.object({
  title: z.string(),
  overview: z.string(),
  components: z.array(
    z.object({
      name: z.string(),
      awsService: z.string(),
      description: z.string(),
    })
  ),
  dataFlow: z.array(z.string()),
  security: z.array(z.string()),
  scaling: z.array(z.string()),
  estimatedMonthlyCost: z.string(),
  diagramAscii: z.string(),
});

export type AWSArchitecture = z.infer<typeof architectureSchema>;

export async function generateAWSArchitecture(requirements: string): Promise<AWSArchitecture> {
  const prompt = `You are an AWS Solutions Architect. A user has the following requirements:

"${requirements}"

Design a practical, cost-effective AWS architecture. Be specific about which exact AWS services to use.

- title: short architecture name (e.g. "Highly Available Django on ECS + RDS")
- overview: 2-3 sentence summary
- components: list each major AWS service (e.g. ALB, ECS Fargate, RDS PostgreSQL, ElastiCache, S3, CloudFront, Route53)
- dataFlow: describe traffic flow step-by-step (e.g. "User → Route53 → CloudFront → ALB → ECS → RDS")
- security: key security practices (IAM roles, security groups, WAF, secrets manager, etc.)
- scaling: scaling strategy (Auto Scaling Groups, ECS task scaling, RDS read replicas, etc.)
- estimatedMonthlyCost: rough total monthly cost estimate (e.g. "$120-180/month on t3.small instances")
- diagramAscii: a simple ASCII diagram of the architecture (use arrows →, boxes with [Service], max 15 lines)`;

  const { object } = await withFallback([
    () => generateObject({ model: EXTRACT_MODEL, schema: architectureSchema, prompt }),
    () => generateObject({ model: EXTRACT_MODEL_FALLBACK, schema: architectureSchema, prompt }),
  ]);
  return object;
}
