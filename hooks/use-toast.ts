// hooks/use-toast.ts
import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';
import type { ToasterProps } from 'sonner';

type ToasterToast = ToasterProps & {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  type?: 'error' | 'success' | 'info';
};

type LocalToasterProps = {
  toast: (props: Omit<ToasterToast, 'id'>) => string;
  dismiss: (toastId?: string) => void;
  update: (props: ToasterToast) => void;
  toasts: ToasterToast[];
};


export const useToast = (): LocalToasterProps => {
  const toast = useCallback(({ title, description, action, variant, type, ...props }: Omit<ToasterToast, 'id'>) => {
    const id = sonnerToast(title, {
      description,
      action,
      className: variant === 'destructive' || type === 'error' ? 'bg-red-500 text-white' : undefined,
      ...props,
    });
    return id as string;
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  }, []);

  const update = useCallback(({ id, title, description, action, variant, type, ...props }: ToasterToast) => {
    if (id) {
      sonnerToast(title, {
        id,
        description,
        action,
        className: variant === 'destructive' || type === 'error' ? 'bg-red-500 text-white' : undefined,
        ...props,
      });
    }
  }, []);

  return {
    toasts: [], // This is likely unused, keeping for type consistency
    toast,
    dismiss,
    update,
  };
};