"use client";

import { useEffect, useState } from "react";

interface PlanSummary {
  _id: string;
  preferences: string;
  servings: number;
  createdAt: string;
}

interface PlanHistoryProps {
  onSelectPlan: (planId: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PlanHistory({ onSelectPlan }: PlanHistoryProps) {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plan")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-8">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-3 w-3 bg-dim/30 rounded-full" />
          <div className="h-3 w-24 bg-dim/20 rounded" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h3 className="text-dim uppercase tracking-widest text-[10px] font-medium mb-3 text-center">
        Recent Plans
      </h3>
      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan._id}
            onClick={() => onSelectPlan(plan._id)}
            className="w-full text-left p-3 rounded-xl border border-white/[0.07] bg-void
                       hover:bg-white/[0.03] hover:border-atlas/40
                       transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-dim text-xs shrink-0 pt-0.5">
                {timeAgo(plan.createdAt)}
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-dim text-sm truncate group-hover:text-ink transition-colors">
                  &ldquo;{plan.preferences}&rdquo;
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-atlas/20 text-atlas">
                  {plan.servings} {plan.servings === 1 ? "serving" : "servings"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
