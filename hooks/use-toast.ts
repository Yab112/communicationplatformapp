// hooks/use-toast.ts
import { toast as sonnerToast } from 'sonner';
import type { ToasterProps } from 'sonner';

type ToasterToast = ToasterProps & {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

type LocalToasterProps = {
  toast: (props: Omit<ToasterToast, 'id'>) => string;
  dismiss: (toastId?: string) => void;
  update: (props: ToasterToast) => void;
  toasts: ToasterToast[];
};

export const useToast = (): LocalToasterProps => {
  const toast = ({ title, description, action, ...props }: Omit<ToasterToast, 'id'>) => {
    const id = sonnerToast(title, {
      description,
      action,
      ...props,
    });
    return id as string;
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  };

  const update = ({ id, title, description, action, ...props }: ToasterToast) => {
    if (id) {
      sonnerToast(title, {
        id,
        description,
        action,
        ...props,
      });
    }
  };

  return {
    toasts: [],
    toast,
    dismiss,
    update,
  };
};