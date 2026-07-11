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

  async function deletePlan(id: string, preferences: string) {
    if (!window.confirm(`Delete the plan "${preferences}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/plan/${id}`, { method: "DELETE" });
      if (res.ok) setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch {
      // Leave the row in place; user can retry.
    }
  }

  if (loading) {
    return (
      <div className="w-full mt-8">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-3 w-3 bg-muted/30" />
          <div className="h-3 w-24 bg-muted/20" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h3 className="font-display uppercase tracking-widest text-xs text-ink border-b-2 border-ink pb-1.5 mb-3 text-left">
        Recent plans
      </h3>
      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan._id} className="relative">
            <button
              onClick={() => onSelectPlan(plan._id)}
              className="w-full text-left p-3 pr-10 border-2 border-ink bg-white
                         hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                         active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                         transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted text-[10px] uppercase tracking-widest shrink-0 pt-1">
                  {timeAgo(plan.createdAt)}
                </span>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-ink text-sm truncate">
                    &ldquo;{plan.preferences}&rdquo;
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 bg-atlas text-white">
                    {plan.servings} {plan.servings === 1 ? "serving" : "servings"}
                  </span>
                </div>
              </div>
            </button>
            <button
              onClick={() => deletePlan(plan._id, plan.preferences)}
              aria-label={`Delete plan: ${plan.preferences}`}
              className="absolute top-2 right-2 w-6 h-6 border-2 border-ink bg-white text-ink
                         flex items-center justify-center text-xs leading-none
                         hover:bg-red-100 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
