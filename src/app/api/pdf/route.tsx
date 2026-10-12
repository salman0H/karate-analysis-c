import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/pdf/report-document";

interface PdfRequestBody {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  metrics: Record<string, number | string>;
  selfieDataUrl?: string | null;
  report: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as PdfRequestBody;

  if (!body.fullName || !body.metrics || !body.report) {
    return NextResponse.json({ error: "داده‌های ورودی برای ساخت گزارش ناقص است." }, { status: 400 });
  }

  const generatedAt = new Intl.DateTimeFormat("fa-IR").format(new Date());
  const document = (
    <ReportDocument
      fullName={body.fullName}
      gender={body.gender}
      age={body.age}
      metrics={body.metrics}
      selfieDataUrl={body.selfieDataUrl}
      report={body.report}
      generatedAt={generatedAt}
    />
  );

  try {
    const buffer = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${encodeURIComponent(body.fullName)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed", error);
    return NextResponse.json({ error: "خطا در ساخت فایل PDF" }, { status: 500 });
  }
}
