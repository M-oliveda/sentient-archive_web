/* eslint-disable react-refresh/only-export-components */
import React from "react";

type MotionProps = {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    initial?: unknown;
    animate?: unknown;
    whileInView?: unknown;
    exit?: unknown;
    variants?: unknown;
    transition?: unknown;
    viewport?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    [key: string]: unknown;
};

function makeMotion(tag: keyof React.JSX.IntrinsicElements) {
    return function MotionComponent({
        initial: _i,
        animate: _a,
        whileInView: _w,
        exit: _e,
        variants: _v,
        transition: _t,
        viewport: _vp,
        whileHover: _wh,
        whileTap: _wt,
        ...rest
    }: MotionProps) {
        return React.createElement(tag, rest);
    };
}

const MotionDiv = makeMotion("div");
const MotionSection = makeMotion("section");
const MotionSpan = makeMotion("span");
const MotionH1 = makeMotion("h1");
const MotionH2 = makeMotion("h2");
const MotionH3 = makeMotion("h3");
const MotionP = makeMotion("p");
const MotionUl = makeMotion("ul");
const MotionLi = makeMotion("li");
const MotionHeader = makeMotion("header");
const MotionFooter = makeMotion("footer");

export const motion = {
    div: MotionDiv,
    section: MotionSection,
    span: MotionSpan,
    h1: MotionH1,
    h2: MotionH2,
    h3: MotionH3,
    p: MotionP,
    ul: MotionUl,
    li: MotionLi,
    header: MotionHeader,
    footer: MotionFooter,
};

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

export const useInView = () => true;
