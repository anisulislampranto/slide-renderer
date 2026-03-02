import { SlideNode } from "@/types/slide";

interface Props {
    node: SlideNode;
}

export default function RenderNode({ node }: Props) {
    switch (node.type) {
        case "container":
        case "row":
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            node.type === "row"
                                ? "row"
                                : node.layout?.direction || "column",
                        gap: node.layout?.gap ?? 0,
                        padding: node.layout?.padding,
                        background: node.background,
                        ...node.style,
                    }}
                >
                    {node.children?.map((child, index) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </div>
            );

        case "text":
            return (
                <div style={node.style}>
                    {node.content}
                </div>
            );

        case "button":
            return (
                <button
                    style={{
                        padding: "12px 20px",
                        border: "none",
                        cursor: "pointer",
                        ...node.style
                    }}
                >
                    {node.label}
                </button>
            );

        case "image":
            return (
                <img
                    src={node.src}
                    style={{
                        width: node.size?.width,
                        height: node.size?.height,
                        ...node.style
                    }}
                />
            );

        case "info-block":
            return (
                <div style={{ ...node.style }}>
                    <div style={{ fontWeight: "bold" }}>
                        {node.title} {node.hasDropdown && "▼"}
                    </div>
                    <div>{node.description}</div>
                </div>
            );

        default:
            return null;
    }
}