"use client";

import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useProgressPageVM } from "./ProgressPageVM";
import { ProgressLastSessionFeedback } from "./sections/ProgressLastSessionFeedback";
import { ProgressPRPanel } from "./sections/ProgressPRPanel";
import { ProgressQualityTipItem } from "./sections/ProgressQualityTipItem";
import { ProgressStatCard } from "./sections/ProgressStatCard";
import { ProgressStreakSummary } from "./sections/ProgressStreakSummary";

export default function ProgressPage() {
  const vm = useProgressPageVM();

  if (vm.isLoading) {
    return <LoadingSpinner label="Loading progress..." />;
  }

  return (
    <div className="space-y-8">
      <InfoPanel
        title="Progress"
        layout="row"
        maxPerRow={4}
        outerButton={{
          label: vm.scopeLabel,
          onClick: vm.toggleScope,
        }}
      >
        {vm.showStatsEmpty ? (
          <EmptyState
            icon="^"
            title="No progress data yet"
            description="Complete your first workout to start tracking stats and PRs."
          />
        ) : (
          vm.statsCards.map((stat) => (
            <ProgressStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              subLabel={stat.subLabel}
            />
          ))
        )}

        {vm.streakCard && (
          <ProgressStreakSummary
            label={vm.streakCard.label}
            value={vm.streakCard.value}
            subLabel={vm.streakCard.subLabel}
          />
        )}
      </InfoPanel>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <ProgressPRPanel
          items={vm.prsItems}
          isEmpty={vm.showPrsEmpty}
          pageKey={vm.scopeLabel}
        />

        {vm.lastSessionView.kind === "available" && (
          <ProgressLastSessionFeedback
            label={vm.lastSessionView.feedbackLabel}
            streak={vm.lastSessionView.streak}
            onSelect={vm.lastSessionView.onSelect}
          />
        )}

        {vm.lastSessionView.kind === "submitted" && (
          <ProgressLastSessionFeedback submitted />
        )}

        {vm.lastSessionView.kind === "seen" && (
          <ProgressLastSessionFeedback
            label={vm.lastSessionView.label}
            streak={vm.lastSessionView.streak}
            disableButtons={vm.lastSessionView.disableButtons}
          />
        )}

        {vm.lastSessionView.kind === "none" && (
          <EmptyState
            icon="!"
            title={vm.lastSessionView.empty.title}
            description={vm.lastSessionView.empty.description}
          />
        )}
      </div>

      <InfoPanel title="Training quality">
        {vm.qualityTips.map((tip) => (
          <ProgressQualityTipItem
            key={tip.label}
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
