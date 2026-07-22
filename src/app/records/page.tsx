"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRecords } from "@/hooks/useRecords";
import { useToast } from "@/hooks/useToast";
import { loadCurrentSheet, saveCurrentSheet, type CurrentSheet } from "@/lib/storage";
import { sheetFromRecord, type SavedRecord } from "@/lib/records";
import { EXAM_LABELS, PRESETS, type ExamType } from "@/lib/presets";
import {
  computeStatCards,
  computeSubjectPerformance,
  computeTargetProgress,
  computeTrendSeries,
  strongestAndWeakest,
} from "@/lib/analytics";
import ExamTypeFilter from "@/components/records/ExamTypeFilter";
import StatCards from "@/components/records/StatCards";
import TargetCard from "@/components/records/TargetCard";
import HistoryList from "@/components/records/HistoryList";
import BackupControls from "@/components/records/BackupControls";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import styles from "./page.module.css";

const TrendChart = dynamic(() => import("@/components/records/TrendChart"), { ssr: false });
const SubjectRadar = dynamic(() => import("@/components/records/SubjectRadar"), { ssr: false });
const SubjectProgress = dynamic(() => import("@/components/records/SubjectProgress"), {
  ssr: false,
});
const UnitBreakdown = dynamic(() => import("@/components/records/UnitBreakdown"), {
  ssr: false,
});

const EMPTY_TARGETS: CurrentSheet["targets"] = { jee: null, test: null, subjective: null };

export default function RecordsPage() {
  const router = useRouter();
  const { records, remove, importFromJSON, exportJSON } = useRecords();
  const { message: toastMessage, showToast } = useToast();
  const [examType, setExamType] = useState<ExamType>("jee");
  const [targets, setTargets] = useState<CurrentSheet["targets"]>(EMPTY_TARGETS);

  useEffect(() => {
    // Deferred to after mount: localStorage isn't available during static prerendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets(loadCurrentSheet().targets);
  }, []);

  const filtered = useMemo(
    () => records.filter((r) => r.examType === examType),
    [records, examType],
  );
  const sections = PRESETS[examType].sections;

  const stats = useMemo(() => computeStatCards(filtered), [filtered]);
  const trend = useMemo(() => computeTrendSeries(filtered), [filtered]);
  const performance = useMemo(() => computeSubjectPerformance(filtered), [filtered]);
  const { strongest, needsWork } = useMemo(() => strongestAndWeakest(performance), [performance]);
  const targetProgress = useMemo(
    () => computeTargetProgress(stats.best ?? 0, targets[examType]),
    [stats.best, targets, examType],
  );

  const handleTargetChange = useCallback(
    (value: number | null) => {
      setTargets((prev) => {
        const next = { ...prev, [examType]: value };
        saveCurrentSheet({ ...loadCurrentSheet(), targets: next });
        return next;
      });
    },
    [examType],
  );

  const handleReopen = useCallback(
    (record: SavedRecord) => {
      const current = loadCurrentSheet();
      saveCurrentSheet(sheetFromRecord(record, current.targets));
      router.push("/evaluate");
    },
    [router],
  );

  const handleExport = useCallback(() => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `omr-evaluator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup exported");
  }, [exportJSON, showToast]);

  const handleImportFile = useCallback(
    (file: File) => {
      file.text().then((text) => {
        try {
          const result = importFromJSON(text);
          const parts = [`Imported ${result.added} record${result.added === 1 ? "" : "s"}`];
          if (result.duplicates > 0) parts.push(`${result.duplicates} already existed`);
          if (result.invalid > 0) parts.push(`${result.invalid} invalid`);
          showToast(parts.join(", "));
        } catch {
          showToast("Import failed: not a valid backup file");
        }
      });
    },
    [importFromJSON, showToast],
  );

  return (
    <main className={styles.main}>
      <div className={styles.topRow}>
        <ExamTypeFilter value={examType} onChange={setExamType} />
        <BackupControls onExport={handleExport} onImportFile={handleImportFile} />
      </div>

      <TargetCard
        examType={examType}
        progress={targetProgress}
        onTargetChange={handleTargetChange}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${EXAM_LABELS[examType]} attempts yet`}
          description="Grade and save a sheet in Evaluate to start tracking progress here."
        />
      ) : (
        <>
          <StatCards stats={stats} />
          <TrendChart data={trend} target={targetProgress.target} />
          {sections.length > 0 && (
            <SubjectRadar
              performance={performance}
              strongest={strongest}
              needsWork={needsWork}
              hasPrevious={filtered.length > 1}
            />
          )}
          {sections.length > 0 && <SubjectProgress records={filtered} sections={sections} />}
          {examType === "subjective" && <UnitBreakdown records={filtered} />}
        </>
      )}

      <HistoryList records={filtered} onReopen={handleReopen} onDelete={remove} />

      <Toast message={toastMessage} />
    </main>
  );
}
