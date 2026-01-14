import React from 'react';
import { displacementMap, polarDisplacementMap, prominentDisplacementMap } from "../utils/utils";

// Helper to get the correct displacement map based on the mode
const getMap = (
    mode: "standard" | "polar" | "prominent" | "shader",
    shaderMapUrl?: string
) => {
    switch (mode) {
        case "standard":
            return displacementMap;
        case "polar":
            return polarDisplacementMap;
        case "prominent":
            return prominentDisplacementMap;
        case "shader":
            return shaderMapUrl || displacementMap;
        default:
            return displacementMap;
    }
};

interface GlassFilterProps {
    id: string;
    displacementScale: number;
    aberrationIntensity: number;
    width: number;
    height: number;
    mode: "standard" | "polar" | "prominent" | "shader";
    shaderMapUrl?: string;
}

const GlassFilter: React.FC<GlassFilterProps> = ({
    id,
    displacementScale,
    aberrationIntensity,
    width,
    height,
    mode,
    shaderMapUrl,
}) => (
    <svg
        style={{
            position: "absolute",
            width: width,
            height: height,
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: 'none', // Ensure it doesn't block clicks
        }}
        aria-hidden="true"
    >
        <defs>
            <filter
                id={id}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
                colorInterpolationFilters="sRGB"
            >
                <feImage
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    result="DISPLACEMENT_MAP"
                    href={getMap(mode, shaderMapUrl)}
                    preserveAspectRatio="none"
                />

                {/* Simple displacement mapping */}
                <feDisplacementMap
                    in="SourceGraphic"
                    in2="DISPLACEMENT_MAP"
                    scale={displacementScale * (mode === "shader" ? 1 : -1)}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="DISPLACED"
                />

                {/* Optional subtle blur for smoother effect */}
                <feGaussianBlur
                    in="DISPLACED"
                    stdDeviation={Math.max(0.1, aberrationIntensity * 0.3)}
                    result="BLURRED"
                />
            </filter>
        </defs>
    </svg>
);

export default GlassFilter;
