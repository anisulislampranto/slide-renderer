"use client";

import { useMemo, useState } from "react";
import Renderer from "@/components/Renderer";

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const parsed = useMemo<unknown>(() => {
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const isValid = parsed !== null;
  const canCopy = jsonInput.trim().length > 0;

  const handleCopyJson = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(jsonInput);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-neutral-800 px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold tracking-wide">
            JSON Renderer
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Paste structured JSON and preview the rendered slide below.
          </p>
        </div>
      </header>

      {/* Preview Section */}
      <section className="flex-1 px-8 py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-lg font-medium mb-6">Slide Preview</h2>

          <div className="bg-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-800 flex justify-center">
            {isValid ? (
              <Renderer data={parsed} />
            ) : (
              <div className="text-neutral-500 text-sm">
                Fix JSON errors to preview slide.
              </div>
            )}
          </div>

        </div>
      </section>


      {/* JSON Editor Section */}
      <section className="px-8 py-6 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">JSON Input</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                disabled={!canCopy}
                className="text-xs px-3 py-1 rounded-full border border-neutral-600 bg-neutral-800 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition"
              >
                {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy JSON"}
              </button>

              <span
                className={`text-xs px-3 py-1 rounded-full ${isValid
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "bg-red-600/20 text-red-400"
                  }`}
              >
                {isValid ? "Valid JSON" : "Invalid JSON"}
              </span>
            </div>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your slide JSON here..."
            className="w-full h-screen bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </section>
    </div>
  );
}