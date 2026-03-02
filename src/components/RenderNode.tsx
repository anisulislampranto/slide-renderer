import { CSSProperties } from "react";
import { NormalizedSlideNode } from "@/lib/slide-normalizer";

interface Props {
    node: NormalizedSlideNode;
}

export default function RenderNode({ node }: Props) {
    const type = node.type.toLowerCase();

    const children = node.children.map((child, index) => (
        <RenderNode key={`${child.id ?? child.type}-${index}`} node={child} />
    ));

    const containerTypes = new Set([
        "container",
        "row",
        "column",
        "group",
        "stack",
        "frame",
        "section",
        "wrapper",
        "layer",
        "grid",
        "block",
    ]);
    const textTypes = new Set(["text", "title", "heading", "paragraph", "caption"]);
    const imageTypes = new Set(["image", "photo", "picture", "icon", "logo"]);
    const buttonTypes = new Set(["button", "cta", "link"]);
    const embedTypes = new Set(["map", "chart", "iframe", "embed", "video"]);
    const shapeTypes = new Set(["shape", "rect", "rectangle", "circle", "line", "divider", "spacer"]);

    if (textTypes.has(type)) {
        return <div style={node.style}>{node.text ?? node.label ?? ""}</div>;
    }

    if (imageTypes.has(type) && node.src) {
        return (
            <img
                src={node.src}
                alt={node.alt ?? node.label ?? "slide-image"}
                style={node.style}
            />
        );
    }

    if (buttonTypes.has(type)) {
        return (
            <button
                style={{
                    padding: "12px 20px",
                    border: "none",
                    cursor: "pointer",
                    ...node.style,
                }}
            >
                {node.label ?? node.text ?? "Button"}
            </button>
        );
    }

    if (embedTypes.has(type)) {
        const src = node.embedUrl ?? node.src;
        if (src) {
            return (
                <iframe
                    src={src}
                    title={node.label ?? node.text ?? `${type}-embed`}
                    style={{
                        border: "none",
                        ...node.style,
                    }}
                />
            );
        }

        return (
            <div
                style={{
                    ...placeholderStyle,
                    ...node.style,
                }}
            >
                {node.label ?? node.text ?? type.toUpperCase()}
                {children}
            </div>
        );
    }

    if (shapeTypes.has(type)) {
        return <div style={node.style}>{children}</div>;
    }

    if (containerTypes.has(type)) {
        const style: CSSProperties = {
            display: node.style.display ?? "flex",
            flexDirection: type === "row" ? "row" : node.style.flexDirection ?? "column",
            ...node.style,
        };

        return <div style={style}>{children}</div>;
    }

    const hasRenderableText = typeof node.text === "string" && node.text.length > 0;
    if (hasRenderableText || children.length > 0) {
        return (
            <div style={node.style}>
                {node.text}
                {children}
            </div>
        );
    }

    return <div style={node.style} />;
}

const placeholderStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(255,255,255,0.5)",
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    minHeight: 80,
    padding: 8,
    textAlign: "center",
};
