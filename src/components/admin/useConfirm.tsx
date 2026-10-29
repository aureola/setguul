"use client";

import { useCallback, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Drop-in async replacement for `window.confirm(message)` that renders a
 * styled modal instead of the native browser dialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   if (!(await confirm("Устгах уу?"))) return;
 *   ...
 *   return <>{ConfirmDialog}...</>;
 */
export function useConfirm() {
  const [state, setState] = useState<{ message: string; options?: ConfirmOptions } | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ message, options });
    });
  }, []);

  function settle(result: boolean) {
    setState(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }

  const ConfirmDialog = state ? (
    <ConfirmModal
      message={state.message}
      title={state.options?.title}
      confirmLabel={state.options?.confirmLabel}
      cancelLabel={state.options?.cancelLabel}
      danger={state.options?.danger}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, ConfirmDialog };
}
