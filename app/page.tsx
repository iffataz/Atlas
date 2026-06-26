"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import AtlasLogo from "@/components/AtlasLogo";
import VoiceRecorder, { VoiceStatus } from "@/components/VoiceRecorder";
import MealPlanGrid from "@/components/MealPlanGrid";
import ShoppingList from "@/components/ShoppingList";
import PlanHistory from "@/components/PlanHistory";
import { IDayPlan, IShoppingItem } from "@/lib/models/MealPlan";

type AppState = "idle" | "generating" | "refining" | "ready";
type Tab = "plan" | "shopping";

interface PlanData {
  planId: string;
  days: IDayPlan[];
  shoppingList: IShoppingItem[];
  preferences: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(2);
  const planSectionRef = useRef<HTMLElement>(null);

  async function handlePreferences(transcript: string) {
    setVoiceStatus("processing");
    setAppState("generating");
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: transcript, servings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan.");
      setPlan({ planId: data.planId, days: data.days, shoppingList: data.shoppingList, preferences: transcript });
      setAppState("ready");
      setVoiceStatus("idle");
      setTimeout(() => {
        planSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAppState("idle");
      setVoiceStatus("idle");
    }
  }

  async function handleRefinement(transcript: string) {
    if (!plan) return;
    setVoiceStatus("refining");
    setAppState("refining");
    setError(null);

    try {
      const res = await fetch(`/api/plan/${plan.planId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to refine plan.");
      setPlan((prev) => prev ? { ...prev, days: data.days, shoppingList: data.shoppingList } : prev);
      setAppState("ready");
      setVoiceStatus("idle");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAppState("ready");
      setVoiceStatus("idle");
    }
  }

  async function loadPlan(planId: string) {
    setAppState("generating");
    setError(null);

    try {
      const res = await fetch(`/api/plan/${planId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load plan.");
      setPlan({
        planId: String(data._id),
        days: data.days,
        shoppingList: data.shoppingList,
        preferences: data.preferences,
      });
      setServings(data.servings);
      setAppState("ready");
      setTimeout(() => {
        planSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAppState("idle");
    }
  }

  function handleReset() {
    setPlan(null);
    setAppState("idle");
    setVoiceStatus("idle");
    setError(null);
  }

  const isLoading = appState === "generating" || appState === "refining";

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-screen bg-void flex items-center justify-center">
        {/* Radial purple bloom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 25%, rgba(116,71,174,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full py-16">
          <AtlasLogo />

          <p className="text-dim text-base mt-3 mb-10">Your week, spoken once.</p>

          {appState === "idle" && (
            <div className="flex flex-col items-center gap-4 w-full">
              <VoiceRecorder
                onTranscript={handlePreferences}
                status={voiceStatus}
                onStatusChange={setVoiceStatus}
                buttonLabel="Plan my week"
                listeningHint="Describe your dietary needs, cuisine preferences, and any restrictions."
                processingLabel="Generating your meal plan..."
              />

              <select
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="bg-transparent text-dim text-sm focus:outline-none cursor-pointer hover:text-ink transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n} className="bg-void">
                    {n} {n === 1 ? "serving" : "servings"}
                  </option>
                ))}
              </select>

              <p className="text-dim text-sm">
                e.g. &ldquo;I&apos;m vegetarian, love Asian food, keep it budget-friendly&rdquo;
              </p>

              <PlanHistory onSelectPlan={loadPlan} />
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-ink">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" strokeWidth="4" />
                </svg>
                <span className="text-sm font-medium text-ink">
                  {appState === "generating" ? "Creating your meal plan..." : "Updating your plan..."}
                </span>
              </div>
              <p className="text-dim text-xs">This takes about 10–15 seconds.</p>
            </div>
          )}

          {appState === "ready" && plan && (
            <div className="flex flex-col items-center gap-4 mt-2 w-full">
              <p className="text-dim text-sm italic">&ldquo;{plan.preferences}&rdquo;</p>
              <VoiceRecorder
                onTranscript={handleRefinement}
                status={voiceStatus}
                onStatusChange={setVoiceStatus}
                buttonLabel="Refine your plan"
                listeningHint="Say what to change, e.g. 'swap Monday dinner for something Thai'."
                processingLabel="Updating your plan..."
              />
              <button
                onClick={handleReset}
                className="text-dim hover:text-ink text-sm underline transition-colors"
              >
                Start over
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="mt-16 flex justify-center items-center gap-2">
            <span className="text-dim text-xs">Check my code out here</span>
            <a
              href="https://github.com/iffataz/Atlas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/github.png"
                alt="GitHub"
                width={28}
                height={28}
                className="invert opacity-50 hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Plan + Shopping List */}
      {plan && appState === "ready" && (
        <section ref={planSectionRef} className="bg-gray-900 py-12 px-6">
          <div className="container mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
              {(["plan", "shopping"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-atlas text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "plan" ? "Meal Plan" : "Shopping List"}
                </button>
              ))}
            </div>

            {activeTab === "plan" && <MealPlanGrid days={plan.days} />}
            {activeTab === "shopping" && <ShoppingList items={plan.shoppingList} />}
          </div>
        </section>
      )}
    </main>
  );
}
