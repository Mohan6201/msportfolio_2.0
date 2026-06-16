export type InstanceSpec = {
  type: string;
  vcpu: number;
  memGb: number;
  linuxOnDemand: number; // per hour USD
  reserved1yr: number;   // per hour USD (1-year all-upfront effective hourly)
};

export const INSTANCES: InstanceSpec[] = [
  { type: "t3.micro",    vcpu: 2,  memGb: 1,    linuxOnDemand: 0.0104,  reserved1yr: 0.0063 },
  { type: "t3.small",    vcpu: 2,  memGb: 2,    linuxOnDemand: 0.0208,  reserved1yr: 0.0126 },
  { type: "t3.medium",   vcpu: 2,  memGb: 4,    linuxOnDemand: 0.0416,  reserved1yr: 0.0252 },
  { type: "t3.large",    vcpu: 2,  memGb: 8,    linuxOnDemand: 0.0832,  reserved1yr: 0.0504 },
  { type: "t3.xlarge",   vcpu: 4,  memGb: 16,   linuxOnDemand: 0.1664,  reserved1yr: 0.1008 },
  { type: "t3.2xlarge",  vcpu: 8,  memGb: 32,   linuxOnDemand: 0.3328,  reserved1yr: 0.2016 },
  { type: "m5.large",    vcpu: 2,  memGb: 8,    linuxOnDemand: 0.096,   reserved1yr: 0.057  },
  { type: "m5.xlarge",   vcpu: 4,  memGb: 16,   linuxOnDemand: 0.192,   reserved1yr: 0.114  },
  { type: "m5.2xlarge",  vcpu: 8,  memGb: 32,   linuxOnDemand: 0.384,   reserved1yr: 0.228  },
  { type: "m5.4xlarge",  vcpu: 16, memGb: 64,   linuxOnDemand: 0.768,   reserved1yr: 0.456  },
  { type: "c5.large",    vcpu: 2,  memGb: 4,    linuxOnDemand: 0.085,   reserved1yr: 0.051  },
  { type: "c5.xlarge",   vcpu: 4,  memGb: 8,    linuxOnDemand: 0.17,    reserved1yr: 0.102  },
  { type: "c5.2xlarge",  vcpu: 8,  memGb: 16,   linuxOnDemand: 0.34,    reserved1yr: 0.204  },
  { type: "c5.4xlarge",  vcpu: 16, memGb: 32,   linuxOnDemand: 0.68,    reserved1yr: 0.408  },
  { type: "r5.large",    vcpu: 2,  memGb: 16,   linuxOnDemand: 0.126,   reserved1yr: 0.074  },
  { type: "r5.xlarge",   vcpu: 4,  memGb: 32,   linuxOnDemand: 0.252,   reserved1yr: 0.148  },
  { type: "r5.2xlarge",  vcpu: 8,  memGb: 64,   linuxOnDemand: 0.504,   reserved1yr: 0.296  },
  { type: "p3.2xlarge",  vcpu: 8,  memGb: 61,   linuxOnDemand: 3.06,    reserved1yr: 1.836  },
];

export type EC2Estimate = {
  instance: InstanceSpec;
  hoursPerMonth: number;
  count: number;
  onDemandMonthly: number;
  onDemandAnnual: number;
  reservedMonthly: number;
  reservedAnnual: number;
  savingsPercent: number;
};

export function calculateEC2Cost(
  instanceType: string,
  hoursPerMonth: number,
  count: number
): EC2Estimate | null {
  const spec = INSTANCES.find((i) => i.type === instanceType);
  if (!spec) return null;

  const onDemandMonthly = spec.linuxOnDemand * hoursPerMonth * count;
  const reservedMonthly = spec.reserved1yr * hoursPerMonth * count;

  return {
    instance: spec,
    hoursPerMonth,
    count,
    onDemandMonthly,
    onDemandAnnual: onDemandMonthly * 12,
    reservedMonthly,
    reservedAnnual: reservedMonthly * 12,
    savingsPercent: Math.round((1 - spec.reserved1yr / spec.linuxOnDemand) * 100),
  };
}
