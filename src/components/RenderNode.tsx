import { CSSProperties, MouseEvent } from "react";
import { NormalizedSlideNode } from "@/lib/slide-normalizer";

interface Props {
    node: NormalizedSlideNode;
    path: number[];
    selectedPath?: number[] | null;
    onSelectNode?: (path: number[], node: NormalizedSlideNode) => void;
    onContextNode?: (path: number[], node: NormalizedSlideNode) => void;
}

export default function RenderNode({ node, path, selectedPath, onSelectNode, onContextNode }: Props) {
    const type = node.type.toLowerCase();
    const isSelected =
        selectedPath !== null &&
        selectedPath !== undefined &&
        selectedPath.length === path.length &&
        selectedPath.every((segment, index) => segment === path[index]);

    const selectableStyle: CSSProperties = onSelectNode
        ? {
            cursor: "pointer",
            outline: isSelected ? "2px solid #22d3ee" : undefined,
            outlineOffset: isSelected ? 1 : undefined,
        }
        : {};

    const handleSelect = (event: MouseEvent<HTMLElement>) => {
        if (!onSelectNode) return;
        event.stopPropagation();
        onSelectNode(path, node);
    };

    const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
        if (!onContextNode) return;
        event.preventDefault();
        event.stopPropagation();
        onContextNode(path, node);
    };

    const children = node.children.map((child, index) => (
        <RenderNode
            key={`${child.id ?? child.type}-${index}`}
            node={child}
            path={[...path, index]}
            selectedPath={selectedPath}
            onSelectNode={onSelectNode}
            onContextNode={onContextNode}
        />
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
        return (
            <div style={{ ...node.style, ...selectableStyle }} onClick={handleSelect} onContextMenu={handleContextMenu}>
                {node.text ?? node.label ?? ""}
            </div>
        );
    }

    if (imageTypes.has(type) && node.src) {
        return (
            <img
                src={node.src}
                alt={node.alt ?? node.label ?? "slide-image"}
                style={{ ...node.style, ...selectableStyle }}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
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
                    ...selectableStyle,
                }}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
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
                        ...selectableStyle,
                    }}
                    onClick={handleSelect}
                    onContextMenu={handleContextMenu}
                />
            );
        }

        return (
            <div
                style={{
                    ...placeholderStyle,
                    ...node.style,
                    ...selectableStyle,
                }}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
            >
                {node.label ?? node.text ?? type.toUpperCase()}
                {children}
            </div>
        );
    }

    if (shapeTypes.has(type)) {
        return (
            <div style={{ ...node.style, ...selectableStyle }} onClick={handleSelect} onContextMenu={handleContextMenu}>
                {children}
            </div>
        );
    }

    if (containerTypes.has(type)) {
        const style: CSSProperties = {
            display: node.style.display ?? "flex",
            flexDirection: type === "row" ? "row" : node.style.flexDirection ?? "column",
            ...node.style,
        };

        return (
            <div style={{ ...style, ...selectableStyle }} onClick={handleSelect} onContextMenu={handleContextMenu}>
                {children}
            </div>
        );
    }

    const hasRenderableText = typeof node.text === "string" && node.text.length > 0;
    if (hasRenderableText || children.length > 0) {
        return (
            <div style={{ ...node.style, ...selectableStyle }} onClick={handleSelect} onContextMenu={handleContextMenu}>
                {node.text}
                {children}
            </div>
        );
    }

    return <div style={{ ...node.style, ...selectableStyle }} onClick={handleSelect} onContextMenu={handleContextMenu} />;
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
