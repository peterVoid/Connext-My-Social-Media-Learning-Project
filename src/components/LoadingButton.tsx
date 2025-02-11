import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  buttonText: string;
  className?: string;
}

export default function LoadingButton({
  isLoading,
  buttonText,
  className,
  ...buttonProps
}: LoadingButtonProps) {
  if (!isLoading) {
    return (
      <button
        type="submit"
        className={cn(
          "text-md w-full rounded-lg bg-white py-2 font-bold text-black",
          className,
        )}
        {...buttonProps}
      >
        {buttonText}
      </button>
    );
  }

  return (
    <Button
      className={cn(
        "text-md w-full rounded-lg bg-white py-2 font-bold text-black disabled:cursor-not-allowed",
        className,
      )}
      disabled
    >
      <Loader2 className="animate-spin" />
    </Button>
  );
}
