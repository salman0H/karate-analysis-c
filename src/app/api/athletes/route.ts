import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJalaliString, jalaliToGregorian } from "@/lib/jalali";

interface SaveAthleteBody {
  fullName: string;
  gender: "MALE" | "FEMALE";
  birthDateJalali: string;
  selfieDataUrl?: string | null;
  metrics: Record<string, number | string>;
  aiReport?: string | null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SaveAthleteBody;

  const parsedBirth = parseJalaliString(body.birthDateJalali);
  if (!parsedBirth) {
    return NextResponse.json({ error: "تاریخ تولد شمسی نامعتبر است." }, { status: 400 });
  }
  const birthDateISO = jalaliToGregorian(parsedBirth.jy, parsedBirth.jm, parsedBirth.jd);

  const athlete = await prisma.athlete.create({
    data: {
      fullName: body.fullName,
      gender: body.gender,
      birthDateJalali: body.birthDateJalali,
      birthDateISO,
      selfieUrl: body.selfieDataUrl ?? null,
      assessments: {
        create: {
          metrics: body.metrics,
          aiReport: body.aiReport ?? null,
          selfieUrl: body.selfieDataUrl ?? null,
        },
      },
    },
    include: { assessments: true },
  });

  return NextResponse.json({ athlete });
}

export async function GET() {
  const athletes = await prisma.athlete.findMany({
    orderBy: { createdAt: "desc" },
    include: { assessments: { orderBy: { measuredAt: "desc" }, take: 1 } },
  });
  return NextResponse.json({ athletes });
}
