import { useToast } from "./useToast";
import { handleError } from "@/lib/utils/errorHandler";

const useErrorToast = () => {
  const { toast } = useToast();

  function showErrorToast(message: string, title?: string): void;
  function showErrorToast(
    error: unknown,
    defaultMessage: string,
    title?: string,
  ): void;
  function showErrorToast(
    errorOrMessage: unknown,
    defaultMessageOrTitle?: string,
    title?: string,
  ): void {
    let description: string;
    let resolvedTitle: string;

    if (typeof errorOrMessage === "string") {
      description = errorOrMessage;
      resolvedTitle = defaultMessageOrTitle ?? "오류";
    } else {
      description = handleError(
        errorOrMessage,
        defaultMessageOrTitle ?? "오류가 발생했습니다.",
      );
      resolvedTitle = title ?? "오류";
    }

    toast({
      title: resolvedTitle,
      description,
      variant: "destructive",
    });
  }

  return { showErrorToast };
};

export default useErrorToast;
