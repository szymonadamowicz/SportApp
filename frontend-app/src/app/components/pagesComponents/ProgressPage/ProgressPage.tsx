"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { useProgressPageVM } from "./ProgressPageVM";
import { PRListItem } from "./sections/ProgressPRListItem";
import { ProgressStatCard } from "./sections/ProgressStatCard";
import { ProgressQualityTipItem } from "./sections/ProgressQualityTipItem";
import { ProgressLastSessionFeedback } from "./sections/ProgressLastSessionFeedback";
import { ProgressLastSessionFeedbackKind } from "@/types/pages/progressPage";
import EmptyState from "@/components/EmptyState/EmptyState";

export default function ProgressPage() {
  const vm = useProgressPageVM();
  return (
    <div className="space-y-8">
      <InfoPanel
        title="Progress"
        layout="row"
        maxPerRow={4}
        outerButton={{
          label: `See data for ${
            vm.toggleState ? "this week" : "all trainings"
          }`,
          onClick: vm.settoggleState,
        }}
      >
        {vm.stats.map((stat, idx) => (
          <ProgressStatCard
            key={idx}
            label={stat.title}
            value={vm.toggleState ? (stat.valueWeek ?? "No data") : stat.value}
            subLabel={vm.toggleState ? stat.subLabelWeek : stat.subLabel}
          />
        ))}
      </InfoPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <InfoPanel title="PRs & Benchmarks">
          {vm.prs.map((pr) => (
            <PRListItem
              key={pr.id}
              name={pr.title}
              value={pr.value}
              diff={pr.valueDiff}
            />
          ))}
        </InfoPanel>

        {vm.lastSessionFeedback.kind ===
          ProgressLastSessionFeedbackKind.AVAILABLE && (
          <ProgressLastSessionFeedback
            label={vm.lastSessionFeedback.sessionLabel}
            streak={vm.streak}
            onSelect={vm.lastSessionFeedback.onClick}
          />
        )}

        {vm.lastSessionFeedback.kind ===
          ProgressLastSessionFeedbackKind.SUBMITTED && (
          <ProgressLastSessionFeedback submitted />
        )}

        {vm.lastSessionFeedback.kind ===
          ProgressLastSessionFeedbackKind.SEEN && (
          <ProgressLastSessionFeedback
            label="Thanks for letting us know how your last workout felt."
            streak={vm.streak}
            disableButtons
          />
        )}

        {vm.lastSessionFeedback.kind ===
          ProgressLastSessionFeedbackKind.NONE && (
          <EmptyState
            icon="🏋️"
            title="No completed workouts yet"
            description="Finish your first training and come back here to track your progress."
          />
        )}
      </div>

      <InfoPanel title="Training quality">
        {vm.qualityTips.map((tip, index) => (
          <ProgressQualityTipItem
            key={index}
            label={tip.label}
            value={tip.value}
            tone={tip.tone}
            hint={tip.hint}
          />
        ))}
      </InfoPanel>
    </div>
  );
}
