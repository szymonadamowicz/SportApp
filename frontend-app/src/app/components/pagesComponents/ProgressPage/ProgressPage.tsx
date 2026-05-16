"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useProgressPageVM } from "./ProgressPageVM";
import { PRListItem } from "./sections/ProgressPRListItem";
import { ProgressStatCard } from "./sections/ProgressStatCard";
import { ProgressQualityTipItem } from "./sections/ProgressQualityTipItem";
import { ProgressLastSessionFeedback } from "./sections/ProgressLastSessionFeedback";
import EmptyState from "@/components/EmptyState/EmptyState";

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
            icon="📈"
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
      </InfoPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <InfoPanel title="PRs & Benchmarks">
          {vm.showPrsEmpty ? (
            <EmptyState
              icon="🏆"
              title="No PRs yet"
              description="Once you complete workouts, your best sets will show up here."
            />
          ) : (
            vm.prsItems.map((pr) => (
              <PRListItem
                key={pr.name}
                name={pr.name}
                value={pr.value}
                diff={pr.diff}
              />
            ))
          )}
        </InfoPanel>

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
            icon={vm.lastSessionView.empty.icon}
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
