export type LayoutDirection = "row" | "column";

export interface BaseNode {
    id?: string;
    type: string;
    style?: React.CSSProperties;
}

export interface ContainerNode extends BaseNode {
    type: "container" | "row";
    background?: string;
    layout?: {
        direction?: LayoutDirection;
        gap?: number;
        padding?: number;
    };
    children?: SlideNode[];
}

export interface TextNode extends BaseNode {
    type: "text";
    content: string;
}

export interface ButtonNode extends BaseNode {
    type: "button";
    label: string;
}

export interface ImageNode extends BaseNode {
    type: "image";
    src: string;
    size?: {
        width?: number | string;
        height?: number | string;
    };
}

export interface InfoBlockNode extends BaseNode {
    type: "info-block";
    title: string;
    description: string;
    hasDropdown?: boolean;
}

export type SlideNode =
    | ContainerNode
    | TextNode
    | ButtonNode
    | ImageNode
    | InfoBlockNode;

export interface SlideData {
    background?: string;
    children: SlideNode[];
}