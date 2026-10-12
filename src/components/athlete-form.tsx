"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelfieCapture } from "@/components/selfie-capture";
import {
  CATEGORY_LABELS_FA,
  METRICS_CONFIG,
  MetricCategory,
  getMetricsByCategory,
} from "@/config/metrics.config";
import { athleteFormSchema, AthleteFormValues } from "@/types/athlete";
import { calculateAgeFromJalali } from "@/lib/jalali";

const CATEGORIES: MetricCategory[] = [
  "general",
  "composition",
  "water",
  "bone",
  "metabolic",
  "control",
];

const defaultMetrics = METRICS_CONFIG.reduce<Record<string, string | number>>((acc, m) => {
  acc[m.key] = m.isText ? "" : 0;
  return acc;
}, {});

export function AthleteForm() {
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      fullName: "",
      gender: "MALE",
      birthDateJalali: "",
      selfieDataUrl: null,
      metrics: defaultMetrics as AthleteFormValues["metrics"],
    },
  });

  const birthDateJalali = watch("birthDateJalali");
  const age = useMemo(() => calculateAgeFromJalali(birthDateJalali ?? ""), [birthDateJalali]);

  const [submittedValues, setSubmittedValues] = useState<AthleteFormValues | null>(null);

  async function onSubmit(values: AthleteFormValues) {
    setServerError(null);
    setReport(null);
    setSubmittedValues(values);

    const resolvedAge = calculateAgeFromJalali(values.birthDateJalali);
    if (resolvedAge === null || resolvedAge < 10 || resolvedAge > 50) {
      setServerError("سن محاسبه‌شده باید بین ۱۰ تا ۵۰ سال باشد.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          gender: values.gender,
          age: resolvedAge,
          metrics: values.metrics,
        }),
      });
      if (!res.ok) throw new Error("خطا در دریافت تحلیل هوش مصنوعی");
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleDownloadPdf() {
    if (!submittedValues || !report) return;
    setIsGeneratingPdf(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: submittedValues.fullName,
          gender: submittedValues.gender,
          age,
          metrics: submittedValues.metrics,
          selfieDataUrl: submittedValues.selfieDataUrl,
          report,
        }),
      });
      if (!res.ok) throw new Error("خطا در ساخت فایل PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `گزارش-${submittedValues.fullName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات ورزشکار</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
            <Input id="fullName" {...register("fullName")} placeholder="مثال: علی محمدی" />
            {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="gender">جنسیت</Label>
            <Select id="gender" {...register("gender")}>
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="birthDateJalali">تاریخ تولد شمسی (YYYY/MM/DD)</Label>
            <Input id="birthDateJalali" {...register("birthDateJalali")} placeholder="۱۳۸۵/۰۶/۱۵" />
            {errors.birthDateJalali ? (
              <p className="mt-1 text-xs text-red-600">{errors.birthDateJalali.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                {age !== null ? `سن محاسبه‌شده: ${age} سال` : "تاریخ را وارد کنید تا سن محاسبه شود"}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <Label>عکس سلفی ورزشکار</Label>
            <Controller
              control={control}
              name="selfieDataUrl"
              render={({ field }) => <SelfieCapture value={field.value} onChange={field.onChange} />}
            />
          </div>
        </CardContent>
      </Card>

      {CATEGORIES.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS_FA[category]}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getMetricsByCategory(category).map((metric) => (
              <div key={metric.key}>
                <Label htmlFor={metric.key}>
                  {metric.labelFa}
                  {metric.unit ? <span className="text-slate-400"> ({metric.unit})</span> : null}
                </Label>
                {metric.isText ? (
                  <Select id={metric.key} {...register(`metrics.${metric.key}` as "metrics.weight")}>
                    <option value="">انتخاب کنید</option>
                    {metric.textOptions?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelFa}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={metric.key}
                    type="number"
                    step={metric.step ?? 0.1}
                    min={metric.min}
                    max={metric.max}
                    {...register(`metrics.${metric.key}` as "metrics.weight", { valueAsNumber: true })}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {serverError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          تحلیل هوشمند بدن ورزشکار
        </Button>

        {report ? (
          <Button type="button" variant="secondary" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            دانلود گزارش PDF
          </Button>
        ) : null}
      </div>

      {report ? (
        <Card>
          <CardHeader>
            <CardTitle>تحلیل مربی هوشمند کاراته</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{report}</p>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}
