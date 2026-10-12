import { z } from "zod";
import { METRICS_CONFIG } from "@/config/metrics.config";

// Validated against the metrics registry at runtime (not via a static zod shape) —
// adding a metric to metrics.config.ts automatically extends validation, no code change here.
export const metricsSchema = z
  .record(z.string(), z.union([z.number(), z.string()]))
  .superRefine((data, ctx) => {
    for (const metric of METRICS_CONFIG) {
      const value = data[metric.key];
      if (metric.isText) {
        if (typeof value !== "string" || value.length === 0) {
          ctx.addIssue({ code: "custom", path: [metric.key], message: "این فیلد الزامی است" });
        }
        continue;
      }
      if (typeof value !== "number" || Number.isNaN(value)) {
        ctx.addIssue({ code: "custom", path: [metric.key], message: "مقدار باید عددی باشد" });
        continue;
      }
      if (metric.min !== undefined && value < metric.min) {
        ctx.addIssue({ code: "custom", path: [metric.key], message: `حداقل مقدار ${metric.min}` });
      }
      if (metric.max !== undefined && value > metric.max) {
        ctx.addIssue({ code: "custom", path: [metric.key], message: `حداکثر مقدار ${metric.max}` });
      }
    }
  });

export const athleteFormSchema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی را کامل وارد کنید"),
  gender: z.enum(["MALE", "FEMALE"], { message: "جنسیت را انتخاب کنید" }),
  birthDateJalali: z
    .string()
    .regex(/^\d{3,4}\/\d{1,2}\/\d{1,2}$/, "تاریخ تولد را به صورت ۱۳۸۰/۰۱/۰۱ وارد کنید"),
  selfieDataUrl: z.string().nullable(),
  metrics: metricsSchema,
});

export type AthleteFormValues = z.infer<typeof athleteFormSchema>;
export type MetricsValues = z.infer<typeof metricsSchema>;

export interface AnalyzeRequestPayload {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  metrics: MetricsValues;
}

export interface AnalyzeResponsePayload {
  report: string;
}
