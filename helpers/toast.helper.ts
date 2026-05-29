"use client";

import { toast } from "sonner";

export type ToastVariant = "success" | "error" | "info";

export function showToast(message: string, variant: ToastVariant = "info") {
  switch (variant) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
    default:
      toast(message);
      break;
  }
}
