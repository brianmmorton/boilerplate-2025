import React, { lazy, useEffect, useState } from "react";

const LazyOnboarding = lazy(() =>
  import("./Onboarding").then((module) => ({
    default: module.Onboarding,
  }))
);

export const MaybeOnboarding = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  if (isOpen) {
    return <LazyOnboarding onClose={() => setIsOpen(false)} />;
  }

  return null;
};
