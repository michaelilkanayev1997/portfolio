import { useEffect, useState, memo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

import { particleOptions } from "../data/particlesData";

const ParticlesContainer = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Particles
      className="w-full h-full absolute translate-z-0"
      id="tsparticles"
      options={particleOptions}
    />
  );
};

export default memo(ParticlesContainer);
