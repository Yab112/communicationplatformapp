// store/toast-util.ts
import { toast as sonnerToast } from "sonner";

export function showToast({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success";
}) {
  sonnerToast(title, {
    description,
    className: variant === "destructive" ? "bg-red-500 text-white" : undefined,
  });
}
