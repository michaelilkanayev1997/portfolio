import DragonArtwork from "./DragonArtwork";
import { useDragonAnimation } from "./useDragonAnimation";

const Dragon = () => {
  const refs = useDragonAnimation();

  return <DragonArtwork refs={refs} />;
};

export default Dragon;
