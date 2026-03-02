import RenderNode from "./RenderNode";
import { normalizeSlideData } from "@/lib/slide-normalizer";

interface Props {
    data: unknown;
}

export default function Renderer({ data }: Props) {
    const normalized = normalizeSlideData(data);

    return (
        <div className="flex justify-center w-full overflow-auto">
            <div
                className="shadow-xl"
                style={{
                    width: normalized.width,
                    height: normalized.height,
                    background: normalized.background || "#ffffff",
                    position: "relative",
                    overflow: "hidden",
                    ...normalized.style,
                    transform: "scale(0.7)",
                    transformOrigin: "top center",
                }}
            >
                {normalized.children.map((node, index) => (
                    <RenderNode key={index} node={node} />
                ))}
            </div>
        </div>
    );
}
