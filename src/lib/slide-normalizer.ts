import { CSSProperties } from "react";

const CHILD_KEYS = [
  "children",
  "nodes",
  "elements",
  "layers",
  "items",
  "objects",
  "content",
] as const;

type UnknownRecord = Record<string, unknown>;

export interface NormalizedSlideNode {
  id?: string;
  type: string;
  style: CSSProperties;
  children: NormalizedSlideNode[];
  text?: string;
  label?: string;
  src?: string;
  embedUrl?: string;
  alt?: string;
}

export interface NormalizedSlide {
  width: number;
  height: number;
  background?: string;
  style?: CSSProperties;
  children: NormalizedSlideNode[];
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function firstString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function firstNumber(record: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = readNumber(record[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function firstRecord(record: UnknownRecord, keys: string[]): UnknownRecord | undefined {
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) return value;
  }
  return undefined;
}

function firstArray(record: UnknownRecord, keys: readonly string[]): unknown[] | undefined {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return undefined;
}

function toDimension(value: unknown): number | string | undefined {
  const num = readNumber(value);
  if (num !== undefined) return num;
  return readString(value);
}

function buildStyle(input: UnknownRecord): CSSProperties {
  const style: CSSProperties = {};

  const inlineStyle = input.style;
  if (isRecord(inlineStyle)) Object.assign(style, inlineStyle as CSSProperties);

  const styles = input.styles;
  if (isRecord(styles)) Object.assign(style, styles as CSSProperties);

  const css = input.css;
  if (isRecord(css)) Object.assign(style, css as CSSProperties);

  const size = firstRecord(input, ["size", "dimensions"]);
  if (size) {
    const width = toDimension(size.width);
    const height = toDimension(size.height);
    if (width !== undefined && style.width === undefined) style.width = width;
    if (height !== undefined && style.height === undefined) style.height = height;
  }

  const position = firstRecord(input, ["position", "coords"]);
  const x = firstNumber(input, ["x", "left"]) ?? (position ? firstNumber(position, ["x", "left"]) : undefined);
  const y = firstNumber(input, ["y", "top"]) ?? (position ? firstNumber(position, ["y", "top"]) : undefined);
  if (x !== undefined && style.left === undefined) style.left = x;
  if (y !== undefined && style.top === undefined) style.top = y;
  if ((x !== undefined || y !== undefined) && style.position === undefined) style.position = "absolute";

  const width = toDimension(input.width);
  const height = toDimension(input.height);
  if (width !== undefined && style.width === undefined) style.width = width;
  if (height !== undefined && style.height === undefined) style.height = height;

  const minWidth = toDimension(input.minWidth);
  const minHeight = toDimension(input.minHeight);
  const maxWidth = toDimension(input.maxWidth);
  const maxHeight = toDimension(input.maxHeight);
  if (minWidth !== undefined && style.minWidth === undefined) style.minWidth = minWidth;
  if (minHeight !== undefined && style.minHeight === undefined) style.minHeight = minHeight;
  if (maxWidth !== undefined && style.maxWidth === undefined) style.maxWidth = maxWidth;
  if (maxHeight !== undefined && style.maxHeight === undefined) style.maxHeight = maxHeight;

  const background = firstString(input, ["background", "bg", "backgroundColor"]);
  if (background && style.background === undefined && style.backgroundColor === undefined) {
    style.background = background;
  }

  const backgroundImage = readString(input.backgroundImage);
  if (backgroundImage !== undefined && style.backgroundImage === undefined) {
    style.backgroundImage = backgroundImage;
  }

  const color = firstString(input, ["color", "textColor"]);
  if (color !== undefined && style.color === undefined) style.color = color;

  const opacity = readNumber(input.opacity);
  if (opacity !== undefined && style.opacity === undefined) style.opacity = opacity;

  const zIndex = readNumber(input.zIndex);
  if (zIndex !== undefined && style.zIndex === undefined) style.zIndex = zIndex;

  const borderRadius = toDimension(input.borderRadius);
  if (borderRadius !== undefined && style.borderRadius === undefined) style.borderRadius = borderRadius;

  const fontSize = toDimension(input.fontSize);
  if (fontSize !== undefined && style.fontSize === undefined) style.fontSize = fontSize;

  const fontWeight = readString(input.fontWeight);
  if (fontWeight !== undefined && style.fontWeight === undefined) style.fontWeight = fontWeight;

  const lineHeight = toDimension(input.lineHeight);
  if (lineHeight !== undefined && style.lineHeight === undefined) style.lineHeight = lineHeight;

  const textAlign = readString(input.textAlign) as CSSProperties["textAlign"] | undefined;
  if (textAlign !== undefined && style.textAlign === undefined) style.textAlign = textAlign;

  const fontFamily = readString(input.fontFamily);
  if (fontFamily !== undefined && style.fontFamily === undefined) style.fontFamily = fontFamily;

  const display = readString(input.display) as CSSProperties["display"] | undefined;
  if (display !== undefined && style.display === undefined) style.display = display;

  const layout = firstRecord(input, ["layout", "flex"]);
  const direction =
    readString(input.direction) ??
    readString(input.flexDirection) ??
    (layout ? readString(layout.direction) : undefined);
  if (direction !== undefined && style.flexDirection === undefined) {
    style.flexDirection = direction as CSSProperties["flexDirection"];
  }

  const gap = toDimension(input.gap ?? (layout ? layout.gap : undefined));
  if (gap !== undefined && style.gap === undefined) style.gap = gap;

  const padding = toDimension(input.padding ?? (layout ? layout.padding : undefined));
  if (padding !== undefined && style.padding === undefined) style.padding = padding;

  const margin = toDimension(input.margin ?? (layout ? layout.margin : undefined));
  if (margin !== undefined && style.margin === undefined) style.margin = margin;

  const justifyContent =
    readString(input.justifyContent) ??
    readString(input.justify) ??
    (layout ? readString(layout.justifyContent ?? layout.justify) : undefined);
  if (justifyContent !== undefined && style.justifyContent === undefined) {
    style.justifyContent = justifyContent as CSSProperties["justifyContent"];
  }

  const alignItems =
    readString(input.alignItems) ??
    readString(input.align) ??
    (layout ? readString(layout.alignItems ?? layout.align) : undefined);
  if (alignItems !== undefined && style.alignItems === undefined) {
    style.alignItems = alignItems as CSSProperties["alignItems"];
  }

  const rotate = readNumber(input.rotate ?? input.rotation);
  if (rotate !== undefined) {
    const rotateText = `rotate(${rotate}deg)`;
    style.transform =
      typeof style.transform === "string" && style.transform.length > 0
        ? `${style.transform} ${rotateText}`
        : rotateText;
  }

  return style;
}

function resolveNodeChildren(input: UnknownRecord): unknown[] {
  const direct = firstArray(input, CHILD_KEYS);
  if (direct) return direct;

  const body = firstRecord(input, ["body", "data"]);
  if (body) {
    const nested = firstArray(body, CHILD_KEYS);
    if (nested) return nested;
  }

  return [];
}

function normalizeNode(input: unknown): NormalizedSlideNode | null {
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return {
      type: "text",
      style: {},
      children: [],
      text: String(input),
    };
  }

  if (!isRecord(input)) return null;

  const rawType =
    firstString(input, ["type", "kind", "nodeType", "component", "element", "tag"]) ?? "container";
  const type = rawType.toLowerCase();
  const children = resolveNodeChildren(input)
    .map(normalizeNode)
    .filter((node): node is NormalizedSlideNode => node !== null);

  return {
    id: firstString(input, ["id", "key"]),
    type,
    style: buildStyle(input),
    children,
    text: firstString(input, ["content", "text", "title", "value", "description"]),
    label: firstString(input, ["label", "cta", "name"]),
    src: firstString(input, ["src", "image", "imageUrl", "url", "asset"]),
    embedUrl: firstString(input, ["embedUrl", "iframe", "mapUrl", "chartUrl"]),
    alt: firstString(input, ["alt", "altText"]),
  };
}

function resolveRoot(input: unknown): unknown {
  if (!isRecord(input)) return input;
  const nested = firstRecord(input, ["slide", "page", "data"]);
  if (!nested) return input;
  const hasKnownChildren = firstArray(nested, CHILD_KEYS);
  if (hasKnownChildren) return nested;
  return input;
}

export function normalizeSlideData(input: unknown): NormalizedSlide {
  const root = resolveRoot(input);

  if (Array.isArray(root)) {
    return {
      width: 1280,
      height: 720,
      children: root.map(normalizeNode).filter((node): node is NormalizedSlideNode => node !== null),
    };
  }

  if (!isRecord(root)) {
    return {
      width: 1280,
      height: 720,
      children: [],
    };
  }

  const size = firstRecord(root, ["size", "viewport", "canvas"]);
  const width =
    firstNumber(root, ["width", "w", "slideWidth", "canvasWidth"]) ??
    (size ? firstNumber(size, ["width", "w"]) : undefined) ??
    1280;
  const height =
    firstNumber(root, ["height", "h", "slideHeight", "canvasHeight"]) ??
    (size ? firstNumber(size, ["height", "h"]) : undefined) ??
    720;

  const childrenInput = resolveNodeChildren(root);
  const children = childrenInput
    .map(normalizeNode)
    .filter((node): node is NormalizedSlideNode => node !== null);

  return {
    width,
    height,
    background:
      firstString(root, ["background", "bg", "backgroundColor"]) ??
      (isRecord(root.style) ? firstString(root.style, ["background", "backgroundColor"]) : undefined),
    style: isRecord(root.style) ? (root.style as CSSProperties) : undefined,
    children,
  };
}
