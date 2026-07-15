import { memo, useEffect, useRef, useState } from "react";

import Dragon from "./dragon/Dragon";

const TRIGGER = "dragon";

const DragonGuide = () => {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const bufferRef = useRef("");

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeRef.current) {
        setActive(false);
        bufferRef.current = "";
        return;
      }

      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") {
        bufferRef.current = "";
        return;
      }

      if (event.key.length === 1) {
        bufferRef.current = (
          bufferRef.current + event.key.toLowerCase()
        ).slice(-TRIGGER.length);
        if (bufferRef.current === TRIGGER) {
          bufferRef.current = "";
          setActive((previous) => !previous);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!active) return null;
  return <Dragon />;
};

export default memo(DragonGuide);
