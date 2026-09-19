import { useMemo } from "react";
import { FinPetApp } from "./src/ui/FinPetApp";
import { createLiveSession } from "./src/ui/session/createLiveSession";

export default function App() {
  const ports = useMemo(() => createLiveSession(), []);
  return <FinPetApp ports={ports} />;
}
