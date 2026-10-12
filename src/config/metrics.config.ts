// Dynamic Metrics Registry — single source of truth for the 25 Xiaomi S400 body metrics.
// UI inputs, PDF rendering, and the AI prompt all read from this array instead of
// hardcoding fields, so adding/removing a metric never touches the DB schema or renderers.

export type MetricCategory =
  | "general"
  | "composition"
  | "water"
  | "bone"
  | "metabolic"
  | "control";

export interface MetricDefinition {
  key: string; // field name inside the JSONB `metrics` object
  labelFa: string; // Persian label shown in UI/PDF
  unit: string; // unit shown next to the value ("" if unitless)
  category: MetricCategory;
  min?: number;
  max?: number;
  step?: number;
  isText?: boolean; // true for non-numeric metrics like "Body Type"
  textOptions?: { value: string; labelFa: string }[]; // choices for isText fields
  description?: string; // short helper text, optional
}

export const METRICS_CONFIG: MetricDefinition[] = [
  {
    key: "weight",
    labelFa: "وزن",
    unit: "کیلوگرم",
    category: "general",
    min: 10,
    max: 200,
    step: 0.1,
  },
  {
    key: "heartRate",
    labelFa: "ضربان قلب",
    unit: "ضربه در دقیقه",
    category: "general",
    min: 30,
    max: 220,
    step: 1,
  },
  {
    key: "bmi",
    labelFa: "شاخص توده بدنی",
    unit: "",
    category: "general",
    min: 5,
    max: 60,
    step: 0.1,
  },
  {
    key: "bodyScore",
    labelFa: "امتیاز بدن",
    unit: "امتیاز",
    category: "general",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "bodyWaterMass",
    labelFa: "حجم آب بدن",
    unit: "کیلوگرم",
    category: "water",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "bodyWaterPercentage",
    labelFa: "درصد آب بدن",
    unit: "٪",
    category: "water",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "fatMass",
    labelFa: "توده چربی",
    unit: "کیلوگرم",
    category: "composition",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "bodyFatPercentage",
    labelFa: "درصد چربی بدن",
    unit: "٪",
    category: "composition",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "proteinMass",
    labelFa: "توده پروتئین",
    unit: "کیلوگرم",
    category: "composition",
    min: 0,
    max: 50,
    step: 0.1,
  },
  {
    key: "proteinPercentage",
    labelFa: "درصد پروتئین",
    unit: "٪",
    category: "composition",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "muscleMass",
    labelFa: "توده عضلانی",
    unit: "کیلوگرم",
    category: "composition",
    min: 0,
    max: 150,
    step: 0.1,
  },
  {
    key: "musclePercentage",
    labelFa: "درصد عضله",
    unit: "٪",
    category: "composition",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "boneMineralContent",
    labelFa: "محتوای مواد معدنی استخوان",
    unit: "کیلوگرم",
    category: "bone",
    min: 0,
    max: 10,
    step: 0.01,
  },
  {
    key: "boneMineralPercentage",
    labelFa: "درصد مواد معدنی استخوان",
    unit: "٪",
    category: "bone",
    min: 0,
    max: 20,
    step: 0.1,
  },
  {
    key: "visceralFatRate",
    labelFa: "سطح چربی احشایی",
    unit: "سطح",
    category: "composition",
    min: 0,
    max: 30,
    step: 1,
  },
  {
    key: "bmr",
    labelFa: "نرخ متابولیسم پایه (BMR)",
    unit: "کیلوکالری/روز",
    category: "metabolic",
    min: 300,
    max: 5000,
    step: 1,
  },
  {
    key: "leanBodyMass",
    labelFa: "توده بدون چربی",
    unit: "کیلوگرم",
    category: "composition",
    min: 0,
    max: 150,
    step: 0.1,
  },
  {
    key: "bodyType",
    labelFa: "نوع بدن",
    unit: "",
    category: "general",
    isText: true,
    textOptions: [
      { value: "underweight", labelFa: "کمبود وزن" },
      { value: "balanced", labelFa: "متوازن" },
      { value: "balancedMuscular", labelFa: "متوازن عضلانی" },
      { value: "skinnyFat", labelFa: "لاغر با چربی زیاد" },
      { value: "stocky", labelFa: "درشت‌هیکل" },
      { value: "thickSet", labelFa: "سنگین‌وزن عضلانی" },
      { value: "muscular", labelFa: "عضلانی" },
      { value: "lackExercise", labelFa: "کمبود تحرک" },
      { value: "overweight", labelFa: "اضافه وزن" },
      { value: "obese", labelFa: "چاق" },
      { value: "obeseMuscular", labelFa: "چاق عضلانی" },
    ],
  },
  {
    key: "waistHipRatio",
    labelFa: "نسبت تقریبی دور کمر به باسن",
    unit: "",
    category: "general",
    min: 0.5,
    max: 1.5,
    step: 0.01,
  },
  {
    key: "bodyAge",
    labelFa: "سن بدنی",
    unit: "سال",
    category: "metabolic",
    min: 5,
    max: 100,
    step: 1,
  },
  {
    key: "skeletalMuscleMass",
    labelFa: "توده عضلات اسکلتی",
    unit: "کیلوگرم",
    category: "composition",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "weightControl",
    labelFa: "کنترل وزن",
    unit: "کیلوگرم",
    category: "control",
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    key: "muscleControl",
    labelFa: "کنترل عضله",
    unit: "کیلوگرم",
    category: "control",
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    key: "fatControl",
    labelFa: "کنترل چربی",
    unit: "کیلوگرم",
    category: "control",
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    key: "standardWeight",
    labelFa: "وزن استاندارد",
    unit: "کیلوگرم",
    category: "general",
    min: 10,
    max: 200,
    step: 0.1,
  },
];

export const CATEGORY_LABELS_FA: Record<MetricCategory, string> = {
  general: "شاخص‌های عمومی",
  composition: "ترکیب بدنی",
  water: "آب بدن",
  bone: "تراکم استخوانی",
  metabolic: "متابولیسم و سن بدنی",
  control: "کنترل و اصلاح بدن",
};

export function getMetricByKey(key: string): MetricDefinition | undefined {
  return METRICS_CONFIG.find((m) => m.key === key);
}

export function getMetricsByCategory(category: MetricCategory): MetricDefinition[] {
  return METRICS_CONFIG.filter((m) => m.category === category);
}
