import { AthleteForm } from "@/components/athlete-form";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8 text-center">
        <p className="text-sm font-medium text-red-600">باشگاه کاراته شرکت برق منطقه‌ای خراسان</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          سامانه هوشمند آنالیز بدنی ورزشکار
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات ورزشکار و خروجی دستگاه اسکن بدن را ثبت کنید تا تحلیل تخصصی کاراته و گزارش PDF
          تولید شود.
        </p>
      </header>
      <AthleteForm />
    </main>
  );
}
