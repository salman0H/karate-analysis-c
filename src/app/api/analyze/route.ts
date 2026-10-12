import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { METRICS_CONFIG } from "@/config/metrics.config";
import type { AnalyzeRequestPayload } from "@/types/athlete";

// Decoupled AI layer: this route only talks to Groq. It knows nothing about
// the DB or the PDF — it receives { fullName, gender, age, metrics } and
// returns a Persian Karate-conditioning report built from metrics.config.ts.

function buildMetricsSummary(metrics: Record<string, number | string>) {
  return METRICS_CONFIG.map((metric) => {
    const value = metrics[metric.key];
    if (value === undefined || value === "") return null;
    const resolved = metric.isText
      ? metric.textOptions?.find((o) => o.value === value)?.labelFa ?? value
      : value;
    return `- ${metric.labelFa}: ${resolved}${metric.unit ? ` ${metric.unit}` : ""}`;
  })
    .filter(Boolean)
    .join("\n");
}

function buildPrompt(payload: AnalyzeRequestPayload) {
  const genderFa = payload.gender === "MALE" ? "مرد" : "زن";
  const metricsSummary = buildMetricsSummary(payload.metrics);

  return `شما یک مربی متخصص آماده‌سازی جسمانی (Conditioning Coach) نخبه در رشته کاراته هستید که در باشگاه کاراته شرکت برق منطقه‌ای خراسان فعالیت می‌کنید.

اطلاعات ورزشکار:
- نام: ${payload.fullName}
- جنسیت: ${genderFa}
- سن: ${payload.age} سال

داده‌های بدنی ثبت‌شده از دستگاه اسکن بدن (Xiaomi S400):
${metricsSummary}

وظیفه شما:
۱. این داده‌ها را به طور خاص در چارچوب نیازهای فیزیکی کاراته تحلیل کن: توان انفجاری و سرعت ضربات در کومیته (Kumite)، پایداری و تعادل در کاتا (Kata)، و استقامت عمومی/بی‌هوازی.
۲. نسبت توده عضلانی به درصد چربی بدن، نرخ متابولیسم پایه، چربی احشایی و سن بدنی را با معیارهای یک کاراته‌کار حرفه‌ای مقایسه کن.
۳. نقاط قوت ورزشکار را مشخص کن.
۴. حداکثر ۳ نقطه ضعف یا ریسک را با زبان مستقیم و حرفه‌ای (نه نگران‌کننده) مشخص کن.
۵. یک برنامه اقدام عملی و مشخص (تمرینات قدرتی، تغذیه، ریکاوری) برای ۴ هفته آینده پیشنهاد بده که متناسب با سن و جنسیت ورزشکار باشد.

قالب خروجی:
- کاملاً به زبان فارسی و روان بنویس.
- از زبان مستقیم، حرفه‌ای و قابل‌اجرا استفاده کن؛ از کلی‌گویی پرهیز کن.
- خروجی را با عنوان‌های مشخص (مثلاً «تحلیل کلی»، «نقاط قوت»، «نقاط قابل بهبود»، «برنامه ۴ هفته‌ای») بخش‌بندی کن.
- طول گزارش بین ۳۰۰ تا ۵۰۰ کلمه باشد.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY تنظیم نشده است. فایل .env را بررسی کنید." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as AnalyzeRequestPayload;

  if (!payload.fullName || !payload.metrics) {
    return NextResponse.json({ error: "داده‌های ورودی ناقص است." }, { status: 400 });
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an elite karate conditioning coach. Always respond in professional, fluent Persian (Farsi).",
        },
        { role: "user", content: buildPrompt(payload) },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const report = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Groq analysis failed", error);
    return NextResponse.json({ error: "خطا در ارتباط با سرویس هوش مصنوعی." }, { status: 502 });
  }
}
