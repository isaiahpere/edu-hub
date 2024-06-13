"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

import "react-quill/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
}
const Preview = ({ value }: PreviewProps) => {
  // avoid getting hydration error by importing this dynamic and passing SSR false so that
  // it does not run on server
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="bg-white">
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};

export default Preview;
