import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { METRICS_CONFIG, CATEGORY_LABELS_FA, MetricCategory } from "@/config/metrics.config";

// Vazirmatn supports Persian glyphs and is registered once at module load.
// @react-pdf/renderer needs a real font file (not a CSS @font-face) to shape Arabic/Persian script.
Font.register({
  family: "Vazirmatn",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf" },
    {
      src: "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Vazirmatn",
    direction: "rtl",
    padding: 32,
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#dc2626",
    paddingBottom: 12,
    marginBottom: 16,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  reportTitle: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
  selfie: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  athleteRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  athleteField: { textAlign: "right" },
  athleteLabel: { fontSize: 8, color: "#64748b" },
  athleteValue: { fontSize: 11, fontWeight: "bold" },
  categoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    padding: 6,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 6,
  },
  metricsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  metricCell: {
    width: "31%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 6,
  },
  metricLabel: { fontSize: 8, color: "#64748b", textAlign: "right" },
  metricValue: { fontSize: 10, fontWeight: "bold", textAlign: "right", marginTop: 2 },
  reportSection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  reportHeading: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    color: "#991b1b",
    marginBottom: 6,
  },
  reportBody: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
});

const CATEGORIES: MetricCategory[] = ["general", "composition", "water", "bone", "metabolic", "control"];

interface ReportDocumentProps {
  fullName: string;
  gender: "MALE" | "FEMALE";
  age: number;
  metrics: Record<string, number | string>;
  selfieDataUrl?: string | null;
  report: string;
  generatedAt: string;
}

function formatMetricValue(key: string, value: number | string) {
  const metric = METRICS_CONFIG.find((m) => m.key === key);
  if (!metric) return String(value);
  if (metric.isText) {
    return metric.textOptions?.find((o) => o.value === value)?.labelFa ?? String(value);
  }
  return `${value}${metric.unit ? ` ${metric.unit}` : ""}`;
}

export function ReportDocument({
  fullName,
  gender,
  age,
  metrics,
  selfieDataUrl,
  report,
  generatedAt,
}: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clubName}>باشگاه کاراته شرکت برق منطقه‌ای خراسان</Text>
            <Text style={styles.reportTitle}>گزارش هوشمند آنالیز بدنی ورزشکار</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is not an HTML <img>, it has no alt prop */}
          {selfieDataUrl ? <Image style={styles.selfie} src={selfieDataUrl} /> : null}
        </View>

        <View style={styles.athleteRow}>
          <View style={styles.athleteField}>
            <Text style={styles.athleteLabel}>نام و نام خانوادگی</Text>
            <Text style={styles.athleteValue}>{fullName}</Text>
          </View>
          <View style={styles.athleteField}>
            <Text style={styles.athleteLabel}>جنسیت</Text>
            <Text style={styles.athleteValue}>{gender === "MALE" ? "مرد" : "زن"}</Text>
          </View>
          <View style={styles.athleteField}>
            <Text style={styles.athleteLabel}>سن</Text>
            <Text style={styles.athleteValue}>{age} سال</Text>
          </View>
          <View style={styles.athleteField}>
            <Text style={styles.athleteLabel}>تاریخ گزارش</Text>
            <Text style={styles.athleteValue}>{generatedAt}</Text>
          </View>
        </View>

        {CATEGORIES.map((category) => {
          const categoryMetrics = METRICS_CONFIG.filter((m) => m.category === category);
          return (
            <View key={category}>
              <Text style={styles.categoryTitle}>{CATEGORY_LABELS_FA[category]}</Text>
              <View style={styles.metricsGrid}>
                {categoryMetrics.map((metric) => (
                  <View key={metric.key} style={styles.metricCell}>
                    <Text style={styles.metricLabel}>{metric.labelFa}</Text>
                    <Text style={styles.metricValue}>
                      {formatMetricValue(metric.key, metrics[metric.key] ?? "-")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.reportSection}>
          <Text style={styles.reportHeading}>تحلیل تخصصی مربی هوشمند کاراته</Text>
          <Text style={styles.reportBody}>{report}</Text>
        </View>

        <Text style={styles.footer}>
          این گزارش به صورت خودکار توسط سامانه آنالیز بدنی باشگاه کاراته شرکت برق منطقه‌ای خراسان تولید شده است.
        </Text>
      </Page>
    </Document>
  );
}
