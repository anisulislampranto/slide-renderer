"use client";

import { useMemo, useState } from "react";
import Renderer from "@/components/Renderer";
import { NormalizedSlide, NormalizedSlideNode, normalizeSlideData } from "@/lib/slide-normalizer";

type NumericStyleKey =
  | "fontSize"
  | "width"
  | "height"
  | "padding"
  | "margin"
  | "left"
  | "top"
  | "gap"
  | "borderRadius"
  | "opacity";
type TextStyleKey =
  | "background"
  | "color"
  | "position"
  | "display"
  | "flexDirection"
  | "justifyContent"
  | "alignItems";
type StyleKey = NumericStyleKey | TextStyleKey;

const TEXT_TYPES = new Set(["text", "title", "heading", "paragraph", "caption", "button", "cta", "link"]);
const IMAGE_TYPES = new Set(["image", "photo", "picture", "icon", "logo"]);
const EMBED_TYPES = new Set(["map", "chart", "iframe", "embed", "video"]);
const NUMERIC_STYLE_CONTROLS: Array<{ key: NumericStyleKey; label: string; step: number; min?: number; max?: number }> = [
  { key: "fontSize", label: "Font Size", step: 1, min: 1 },
  { key: "width", label: "Width", step: 10, min: 1 },
  { key: "height", label: "Height", step: 10, min: 1 },
  { key: "padding", label: "Padding", step: 2, min: 0 },
  { key: "margin", label: "Margin", step: 2 },
  { key: "left", label: "Left", step: 5 },
  { key: "top", label: "Top", step: 5 },
  { key: "gap", label: "Gap", step: 2, min: 0 },
  { key: "borderRadius", label: "Radius", step: 2, min: 0 },
  { key: "opacity", label: "Opacity", step: 0.05, min: 0, max: 1 },
];

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [selectedPath, setSelectedPath] = useState<number[] | null>(null);

  const parsed = useMemo<unknown>(() => {
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const isValid = parsed !== null;
  const canCopy = jsonInput.trim().length > 0;
  const normalizedSlide = useMemo<NormalizedSlide | null>(
    () => (isValid ? normalizeSlideData(parsed) : null),
    [isValid, parsed]
  );
  const selectedNode = useMemo(
    () => (normalizedSlide && selectedPath ? getNodeAtPath(normalizedSlide, selectedPath) : null),
    [normalizedSlide, selectedPath]
  );

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

  const updateSelectedNode = (updater: (node: NormalizedSlideNode) => void) => {
    if (!normalizedSlide || !selectedPath) return;

    const draft = JSON.parse(JSON.stringify(normalizedSlide)) as NormalizedSlide;
    const node = getNodeAtPath(draft, selectedPath);
    if (!node) return;

    updater(node);
    setJsonInput(JSON.stringify(draft, null, 2));
  };

  const updateNodeText = (value: string) => {
    updateSelectedNode((node) => {
      if (node.type === "button" || node.type === "cta" || node.type === "link") {
        node.label = value;
      } else {
        node.text = value;
      }
    });
  };

  const updateNodeUrl = (key: "src" | "embedUrl", value: string) => {
    updateSelectedNode((node) => {
      node[key] = value;
    });
  };

  const updateStyleValue = (key: StyleKey, value: string) => {
    updateSelectedNode((node) => {
      if (!value.trim()) {
        delete (node.style as Record<string, unknown>)[key];
        return;
      }

      if (isNumericStyleKey(key)) {
        const numeric = Number.parseFloat(value);
        (node.style as Record<string, unknown>)[key] = Number.isFinite(numeric) ? numeric : value;
      } else {
        (node.style as Record<string, unknown>)[key] = value;
      }
    });
  };

  const adjustStyleNumeric = (key: NumericStyleKey, delta: number, min?: number, max?: number) => {
    updateSelectedNode((node) => {
      const currentRaw = (node.style as Record<string, unknown>)[key];
      const current = toNumericValue(currentRaw) ?? 0;
      let next = current + delta;
      if (typeof min === "number") next = Math.max(min, next);
      if (typeof max === "number") next = Math.min(max, next);
      (node.style as Record<string, unknown>)[key] = roundNumeric(next);
    });
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
              <Renderer
                data={parsed}
                selectedPath={selectedPath}
                onSelectNode={(path) => setSelectedPath(path)}
              />
            ) : (
              <div className="text-neutral-500 text-sm">
                Fix JSON errors to preview slide.
              </div>
            )}
          </div>

          <div className="mt-6 bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
            <h3 className="text-base font-medium mb-3">Element Editor</h3>
            {selectedNode ? (
              <div className="space-y-4 text-sm">
                <p className="text-neutral-300">
                  Selected: <span className="font-semibold text-white">{selectedNode.type}</span>
                </p>

                {TEXT_TYPES.has(selectedNode.type) && (
                  <label className="block">
                    <span className="text-neutral-400">Text</span>
                    <textarea
                      value={selectedNode.text ?? selectedNode.label ?? ""}
                      onChange={(e) => updateNodeText(e.target.value)}
                      className="mt-1 w-full h-24 bg-neutral-950 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </label>
                )}

                {(IMAGE_TYPES.has(selectedNode.type) || selectedNode.src) && (
                  <label className="block">
                    <span className="text-neutral-400">Image URL</span>
                    <input
                      value={selectedNode.src ?? ""}
                      onChange={(e) => updateNodeUrl("src", e.target.value)}
                      className="mt-1 w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </label>
                )}

                {(EMBED_TYPES.has(selectedNode.type) || selectedNode.embedUrl) && (
                  <label className="block">
                    <span className="text-neutral-400">Embed URL</span>
                    <input
                      value={selectedNode.embedUrl ?? ""}
                      onChange={(e) => updateNodeUrl("embedUrl", e.target.value)}
                      className="mt-1 w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </label>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {NUMERIC_STYLE_CONTROLS.map((control) => (
                    <StyleControl
                      key={control.key}
                      label={control.label}
                      value={readStyleValue(selectedNode, control.key)}
                      onChange={(value) => updateStyleValue(control.key, value)}
                      onDecrease={() =>
                        adjustStyleNumeric(control.key, -control.step, control.min, control.max)
                      }
                      onIncrease={() =>
                        adjustStyleNumeric(control.key, control.step, control.min, control.max)
                      }
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <TextStyleControl
                    label="Background"
                    value={readStyleValue(selectedNode, "background")}
                    onChange={(value) => updateStyleValue("background", value)}
                    placeholder="#111111 or linear-gradient(...)"
                  />
                  <TextStyleControl
                    label="Text Color"
                    value={readStyleValue(selectedNode, "color")}
                    onChange={(value) => updateStyleValue("color", value)}
                    placeholder="#ffffff"
                  />
                  <SelectStyleControl
                    label="Position"
                    value={readStyleValue(selectedNode, "position")}
                    onChange={(value) => updateStyleValue("position", value)}
                    options={["", "static", "relative", "absolute"]}
                  />
                  <SelectStyleControl
                    label="Display"
                    value={readStyleValue(selectedNode, "display")}
                    onChange={(value) => updateStyleValue("display", value)}
                    options={["", "block", "inline-block", "flex", "grid"]}
                  />
                  <SelectStyleControl
                    label="Direction"
                    value={readStyleValue(selectedNode, "flexDirection")}
                    onChange={(value) => updateStyleValue("flexDirection", value)}
                    options={["", "row", "column", "row-reverse", "column-reverse"]}
                  />
                  <SelectStyleControl
                    label="Justify"
                    value={readStyleValue(selectedNode, "justifyContent")}
                    onChange={(value) => updateStyleValue("justifyContent", value)}
                    options={["", "flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]}
                  />
                  <SelectStyleControl
                    label="Align Items"
                    value={readStyleValue(selectedNode, "alignItems")}
                    onChange={(value) => updateStyleValue("alignItems", value)}
                    options={["", "stretch", "flex-start", "center", "flex-end", "baseline"]}
                  />
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">
                Click any text, image, shape, or embed in the preview to edit it here.
              </p>
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

function getNodeAtPath(slide: NormalizedSlide, path: number[]): NormalizedSlideNode | null {
  if (path.length === 0) return null;

  let node = slide.children[path[0]];
  if (!node) return null;

  for (let index = 1; index < path.length; index += 1) {
    node = node.children[path[index]];
    if (!node) return null;
  }

  return node;
}

function readStyleValue(node: NormalizedSlideNode, key: StyleKey): string {
  const raw = (node.style as Record<string, unknown>)[key];
  if (raw === undefined || raw === null) return "";
  return String(raw);
}

function toNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function roundNumeric(value: number): number {
  return Math.round(value * 100) / 100;
}

function isNumericStyleKey(key: StyleKey): key is NumericStyleKey {
  return [
    "fontSize",
    "width",
    "height",
    "padding",
    "margin",
    "left",
    "top",
    "gap",
    "borderRadius",
    "opacity",
  ].includes(key);
}

interface StyleControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
}

function StyleControl({ label, value, onChange, onDecrease, onIncrease }: StyleControlProps) {
  return (
    <div className="rounded-md border border-neutral-800 p-3 bg-neutral-950">
      <p className="text-neutral-400 mb-2">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onDecrease}
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 py-1 hover:bg-neutral-800"
        >
          -
        </button>
        <button
          type="button"
          onClick={onIncrease}
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 py-1 hover:bg-neutral-800"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface TextStyleControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextStyleControl({ label, value, onChange, placeholder }: TextStyleControlProps) {
  return (
    <div className="rounded-md border border-neutral-800 p-3 bg-neutral-950">
      <p className="text-neutral-400 mb-2">{label}</p>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

interface SelectStyleControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

function SelectStyleControl({ label, value, onChange, options }: SelectStyleControlProps) {
  return (
    <div className="rounded-md border border-neutral-800 p-3 bg-neutral-950">
      <p className="text-neutral-400 mb-2">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "unset"}
          </option>
        ))}
      </select>
    </div>
  );
}
