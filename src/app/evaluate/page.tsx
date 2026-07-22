"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useCurrentSheet } from "@/hooks/useCurrentSheet";
import { defaultSheet } from "@/lib/storage";
import { PRESETS, sectionForQuestion, type ExamType } from "@/lib/presets";
import { computeSectionBreakdown, computeSummary, type AnswerStatus } from "@/lib/scoring";
import ExamHeader from "@/components/evaluate/ExamHeader";
import ScoreHero from "@/components/evaluate/ScoreHero";
import QuickSummary from "@/components/evaluate/QuickSummary";
import SummaryCard from "@/components/evaluate/SummaryCard";
import MarkButtons from "@/components/evaluate/MarkButtons";
import UndoReset from "@/components/evaluate/UndoReset";
import AnswerSheet from "@/components/evaluate/AnswerSheet";
import styles from "./page.module.css";

function cycleStatus(status: AnswerStatus): AnswerStatus {
  if (status === "correct") return "incorrect";
  if (status === "incorrect") return "unattempted";
  return "correct";
}

export default function EvaluatePage() {
  const [sheet, setSheet] = useCurrentSheet(defaultSheet("neet"));
  const sections = PRESETS[sheet.examType].sections;

  const summary = useMemo(
    () => computeSummary(sheet.answers, sheet.correctMark, sheet.wrongMark),
    [sheet.answers, sheet.correctMark, sheet.wrongMark],
  );

  const breakdown = useMemo(
    () => computeSectionBreakdown(sheet.answers, sections, sheet.correctMark, sheet.wrongMark),
    [sheet.answers, sections, sheet.correctMark, sheet.wrongMark],
  );

  const nextQNumber = sheet.answers.length + 1;
  const isComplete = sheet.answers.length >= sheet.totalQ;
  const nextSection = sectionForQuestion(sections, nextQNumber);

  const handleMark = useCallback(
    (status: AnswerStatus) => {
      setSheet((prev) => {
        if (prev.answers.length >= prev.totalQ) return prev;
        return { ...prev, answers: [...prev.answers, status] };
      });
    },
    [setSheet],
  );

  const handleUndo = useCallback(() => {
    setSheet((prev) => {
      if (prev.answers.length === 0) return prev;
      return { ...prev, answers: prev.answers.slice(0, -1) };
    });
  }, [setSheet]);

  const handleReset = useCallback(() => {
    setSheet((prev) => ({ ...prev, answers: [] }));
  }, [setSheet]);

  const handleTapBubble = useCallback(
    (index: number) => {
      setSheet((prev) => {
        if (index >= prev.answers.length) return prev;
        const answers = [...prev.answers];
        answers[index] = cycleStatus(answers[index]);
        return { ...prev, answers };
      });
    },
    [setSheet],
  );

  const handleExamTypeChange = useCallback(
    (examType: ExamType) => {
      if (
        sheet.answers.length > 0 &&
        !window.confirm("Switching exam type clears your current progress. Continue?")
      ) {
        return;
      }
      setSheet((prev) => ({ ...defaultSheet(examType), title: prev.title, student: prev.student }));
    },
    [sheet.answers.length, setSheet],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "1") handleMark("correct");
      else if (event.key === "2") handleMark("incorrect");
      else if (event.key === "3") handleMark("unattempted");
      else if (event.key === "z" || event.key === "Z" || event.key === "Backspace") handleUndo();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMark, handleUndo]);

  return (
    <main className={styles.main}>
      <ExamHeader
        examType={sheet.examType}
        title={sheet.title}
        student={sheet.student}
        correctMark={sheet.correctMark}
        wrongMark={sheet.wrongMark}
        totalQ={sheet.totalQ}
        onExamTypeChange={handleExamTypeChange}
        onTitleChange={(title) => setSheet((prev) => ({ ...prev, title }))}
        onStudentChange={(student) => setSheet((prev) => ({ ...prev, student }))}
        onCorrectMarkChange={(correctMark) => setSheet((prev) => ({ ...prev, correctMark }))}
        onWrongMarkChange={(wrongMark) => setSheet((prev) => ({ ...prev, wrongMark }))}
        onTotalQChange={(totalQ) => setSheet((prev) => ({ ...prev, totalQ }))}
      />

      <ScoreHero
        score={summary.score}
        maxMarks={sheet.totalQ * sheet.correctMark}
        graded={summary.graded}
        totalQ={sheet.totalQ}
        nextQNumber={nextQNumber}
        nextSectionName={nextSection?.name}
        isComplete={isComplete}
      />

      <MarkButtons
        correctMark={sheet.correctMark}
        wrongMark={sheet.wrongMark}
        disabled={isComplete}
        onMark={handleMark}
      />

      <UndoReset canUndo={sheet.answers.length > 0} onUndo={handleUndo} onReset={handleReset} />

      <QuickSummary breakdown={breakdown} />

      <SummaryCard summary={summary} totalQ={sheet.totalQ} />

      <AnswerSheet
        totalQ={sheet.totalQ}
        sections={sections}
        answers={sheet.answers}
        onTapBubble={handleTapBubble}
      />
    </main>
  );
}
