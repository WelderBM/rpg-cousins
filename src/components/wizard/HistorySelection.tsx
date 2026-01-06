import React, { useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import OriginSelection from "./OriginSelection";
import DeitySelection from "./DeitySelection";

// Step 4 Wrapper: History (Origin + Deity)
const HistorySelection = () => {
  // Internal state to switch between Origin (4A) and Deity (4B)
  // Actually, Step 4 implies both? Or separate?
  // Let's make it granular:
  // Logic: If origin is null, show Origin. If Origin is set but Deity is null, show Deity.
  // Store 'step' is global.
  const { selectedOrigin, selectedDeity } = useCharacterStore();

  // If no origin selected, show Origin Selection
  if (!selectedOrigin) {
    return <OriginSelection />;
  }

  // If origin selected but no Deity, show Deity Selection
  // (Assuming user can switch back? The sub-components usually have "Back" which might need to handle resetting state)
  // For now, strict flow: Origin -> Deity.
  // OriginSelection sets 'selectedOrigin'.

  // We should probably allow going back from Deity to Origin visually?
  // DeitySelection calls `setStep(5)` to go to Summary.

  return <DeitySelection />;
};

export default HistorySelection;
