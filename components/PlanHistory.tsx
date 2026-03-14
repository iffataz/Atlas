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
          <div className="h-3 w-3 bg-gray-600 rounded-full" />
          <div className="h-3 w-24 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h3 className="text-gray-500 uppercase tracking-wider text-xs font-semibold mb-3 text-right">
        Recent Plans
      </h3>
      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan._id}
            onClick={() => onSelectPlan(plan._id)}
            className="w-full text-right p-3 rounded-xl border border-white/10 bg-white/5
                       hover:bg-white/10 hover:border-atlas/50
                       transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-gray-500 text-xs shrink-0 pt-0.5">
                {timeAgo(plan.createdAt)}
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-gray-200 text-sm truncate group-hover:text-white transition-colors">
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
