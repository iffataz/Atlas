"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AtlasLogo from "@/components/AtlasLogo";
import VoiceRecorder, { VoiceStatus } from "@/components/VoiceRecorder";
import MealPlanGrid, { MealType } from "@/components/MealPlanGrid";
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
  // A second submit while a request is in flight would double the paid Groq
  // call, so requests are guarded and abortable.
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  function isAbort(err: unknown) {
    return err instanceof DOMException && err.name === "AbortError";
  }

  // Scroll + move focus to the plan once generation/loading finishes, so
  // keyboard and screen-reader users land on the new content.
  const prevAppStateRef = useRef<AppState>("idle");
  useEffect(() => {
    if (appState === "ready" && prevAppStateRef.current === "generating") {
      planSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      planSectionRef.current?.focus({ preventScroll: true });
    }
    prevAppStateRef.current = appState;
  }, [appState]);

  async function handlePreferences(transcript: string) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setVoiceStatus("processing");
    setAppState("generating");
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: transcript, servings }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan.");
      setPlan({ planId: data.planId, days: data.days, shoppingList: data.shoppingList, preferences: transcript });
      setAppState("ready");
      setVoiceStatus("idle");
    } catch (err: unknown) {
      if (!isAbort(err)) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setAppState("idle");
        setVoiceStatus("idle");
      }
    } finally {
      inFlightRef.current = false;
    }
  }

  async function refinePlan(instruction: string, newServings?: number) {
    if (!plan || inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const previousServings = servings;
    if (newServings) setServings(newServings);
    setVoiceStatus("refining");
    setAppState("refining");
    setError(null);

    try {
      const res = await fetch(`/api/plan/${plan.planId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newServings ? { instruction, servings: newServings } : { instruction }
        ),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to refine plan.");
      setPlan((prev) => prev ? { ...prev, days: data.days, shoppingList: data.shoppingList } : prev);
      setAppState("ready");
      setVoiceStatus("idle");
    } catch (err: unknown) {
      if (!isAbort(err)) {
        if (newServings) setServings(previousServings);
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setAppState("ready");
        setVoiceStatus("idle");
      }
    } finally {
      inFlightRef.current = false;
    }
  }

  function handleRefinement(transcript: string) {
    void refinePlan(transcript);
  }

  async function handleSwapMeal(day: string, mealType: MealType) {
    if (!plan || inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setVoiceStatus("refining");
    setAppState("refining");
    setError(null);

    try {
      const res = await fetch(`/api/plan/${plan.planId}/meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, mealType }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to swap meal.");
      setPlan((prev) => prev ? { ...prev, days: data.days, shoppingList: data.shoppingList } : prev);
      setAppState("ready");
      setVoiceStatus("idle");
    } catch (err: unknown) {
      if (!isAbort(err)) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setAppState("ready");
        setVoiceStatus("idle");
      }
    } finally {
      inFlightRef.current = false;
    }
  }

  function handleServingsChange(n: number) {
    if (n === servings) return;
    void refinePlan(
      `Change the plan to ${n} serving${n === 1 ? "" : "s"} per meal and scale all ingredient quantities accordingly. Keep every meal the same.`,
      n
    );
  }

  async function loadPlan(planId: string) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setAppState("generating");
    setError(null);

    try {
      const res = await fetch(`/api/plan/${planId}`, { signal: controller.signal });
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
    } catch (err: unknown) {
      if (!isAbort(err)) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setAppState("idle");
      }
    } finally {
      inFlightRef.current = false;
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setPlan(null);
    setAppState("idle");
    setVoiceStatus("idle");
    setError(null);
  }

  const isLoading = appState === "generating" || appState === "refining";

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center max-w-xl w-full py-16">
          <AtlasLogo />

          <h1 className="font-display uppercase text-3xl sm:text-4xl leading-tight tracking-tight mt-8 mb-10">
            Your week.
            <br />
            Spoken once.
          </h1>

          {appState === "idle" && (
            <div className="flex flex-col items-center gap-5 w-full">
              <VoiceRecorder
                onTranscript={handlePreferences}
                status={voiceStatus}
                onStatusChange={setVoiceStatus}
                buttonLabel="Plan my week"
                listeningHint="Describe your dietary needs, cuisine preferences, and any restrictions."
                processingLabel="Generating your meal plan"
              />

              <select
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                aria-label="Servings per meal"
                className="border-2 border-ink bg-white text-ink text-sm font-medium uppercase tracking-wide px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "serving" : "servings"}
                  </option>
                ))}
              </select>

              <p className="border-2 border-ink bg-white text-muted text-sm px-4 py-2 max-w-sm">
                e.g. &ldquo;I&apos;m vegetarian, love Asian food, keep it budget-friendly&rdquo;
              </p>

              <PlanHistory onSelectPlan={loadPlan} />
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <p className="font-display uppercase tracking-wide text-base">
                {appState === "generating" ? "Generating your week" : "Updating your plan"}
                <span className="inline-block w-3 h-4 bg-ink ml-2 align-baseline animate-blink" />
              </p>
              <p className="text-muted text-xs uppercase tracking-widest">
                Takes about 10–15 seconds
              </p>
            </div>
          )}

          {appState === "ready" && plan && (
            <div className="flex flex-col items-center gap-5 w-full">
              <p className="border-2 border-ink bg-white text-muted text-sm px-4 py-2 max-w-sm italic">
                &ldquo;{plan.preferences}&rdquo;
              </p>
              <VoiceRecorder
                onTranscript={handleRefinement}
                status={voiceStatus}
                onStatusChange={setVoiceStatus}
                buttonLabel="Refine your plan"
                listeningHint="Say what to change, e.g. 'swap Monday dinner for something Thai'."
                processingLabel="Updating your plan"
              />
              <div className="flex items-center gap-3">
                <label
                  htmlFor="servings-ready"
                  className="text-muted text-xs font-display uppercase tracking-widest"
                >
                  Servings
                </label>
                <select
                  id="servings-ready"
                  value={servings}
                  onChange={(e) => handleServingsChange(Number(e.target.value))}
                  className="border-2 border-ink bg-white text-ink text-sm font-medium uppercase tracking-wide px-3 py-1.5 cursor-pointer focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleReset}
                className="border-2 border-ink bg-white text-ink text-xs font-display uppercase tracking-widest px-4 py-2 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Start over
              </button>
            </div>
          )}

          {error && (
            <div className="border-2 border-ink bg-red-100 px-4 py-3 mt-6 max-w-sm text-left">
              <p className="font-display uppercase tracking-widest text-xs text-red-700 mb-1">
                Error
              </p>
              <p className="text-ink text-sm">{error}</p>
            </div>
          )}

          <a
            href="https://github.com/iffataz/Atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-16 flex items-center gap-2 border-2 border-ink bg-white px-3 py-1.5 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="text-ink text-xs font-display uppercase tracking-widest">
              Check my code out
            </span>
            <Image src="/github.png" alt="GitHub" width={20} height={20} />
          </a>
        </div>
      </section>

      {/* Skeleton while the first plan generates */}
      {appState === "generating" && (
        <section aria-hidden="true" className="border-t-2 border-ink py-12 px-6">
          <div className="container mx-auto max-w-6xl lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
            <div className="lg:col-span-2 space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="shadow-brutal animate-pulse">
                  <div className="bg-ink border-2 border-ink px-4 py-2">
                    <div className="h-4 w-24 bg-white/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 -mt-0.5">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="border-2 border-ink bg-white p-3 h-28">
                        <div className="h-2 w-16 bg-atlas/30 mb-2" />
                        <div className="h-3 w-28 bg-ink/20 mb-1.5" />
                        <div className="h-2 w-full bg-ink/10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block border-2 border-ink bg-white shadow-brutal h-72 animate-pulse" />
          </div>
        </section>
      )}

      {/* Plan + Shopping List — stays visible (dimmed) while refining */}
      {plan && (appState === "ready" || appState === "refining") && (
        <section
          ref={planSectionRef}
          tabIndex={-1}
          className={`border-t-2 border-ink py-12 px-6 focus:outline-none transition-opacity ${
            appState === "refining" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="container mx-auto max-w-6xl">
            {/* Segmented control — mobile only; desktop shows both side by side */}
            <div className="flex mb-8 lg:hidden">
              {(["plan", "shopping"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-xs font-display uppercase tracking-widest border-2 border-ink first:border-r-0 transition-colors ${
                    activeTab === tab
                      ? "bg-ink text-white"
                      : "bg-white text-ink hover:bg-atlas-light"
                  }`}
                >
                  {tab === "plan" ? "Meal plan" : "Shopping"}
                </button>
              ))}
            </div>

            <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
              <div className={`lg:col-span-2 ${activeTab === "plan" ? "block" : "hidden"} lg:block`}>
                <MealPlanGrid days={plan.days} onSwapMeal={handleSwapMeal} />
              </div>
              <div className={`lg:sticky lg:top-8 ${activeTab === "shopping" ? "block" : "hidden"} lg:block`}>
                <ShoppingList items={plan.shoppingList} planId={plan.planId} />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
