"use client";

import { useState } from "react";

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (fn: () => Promise<void>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
}
