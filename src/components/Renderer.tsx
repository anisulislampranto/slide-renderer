import { SlideData } from "@/types/slide";
import RenderNode from "./RenderNode";

interface Props {
    data: SlideData;
}

export default function Renderer({ data }: Props) {
    return (
        <div className="flex justify-center w-full overflow-auto">
            <div
                className="shadow-xl"
                style={{
                    width: 1280,
                    height: 720,
                    background: data.background || "#ffffff",
                    transform: "scale(0.75)",
                    transformOrigin: "top center",
                }}
            >
                {data.children.map((node, index) => (
                    <RenderNode key={index} node={node} />
                ))}
            </div>
        </div>
    );
}