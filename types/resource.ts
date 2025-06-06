import type { ResourceFolder } from "@/types/resource-folder";
import type { User } from "@/types/user";
export interface ResourceUploader {
  id: string;
  name: string;
  avatar: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  fileSize?: string;
  department: string;
  courseId: string;
  fileType: string;
  uploadDate: string;
  tags: string[];
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate: string | null;
  folderIds?: string[];
}

export type FileTypeStyle = {
  bgColor: string;
  borderColor: string;
  iconColor: string;
  badgeColor: string;
  buttonColor: string;
  previewBg: string;
  cardBg: string;
  cardHoverBg: string;
  darkCardBg: string;
  darkCardHoverBg: string;
};

export type ResourceCardProps = {
  resource: Resource;
};

export type PreviewHeaderProps = {
  resource: Resource;
  styling: FileTypeStyle;
  onClose: () => void;
};

export type PreviewToolbarProps = {
  fileType: string;
  zoomLevel: number;
  isFullScreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullScreen: () => void;
  styling: FileTypeStyle;
};

export type PreviewContentProps = {
  resource: Resource;
  fileType: string;
  zoomLevel: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  styling: FileTypeStyle;
  onDownload: () => void;
};

export type PreviewDetailsProps = {
  resource: Resource;
  FileIcon: React.ComponentType;
  styling: FileTypeStyle;
};

export type PreviewFooterProps = {
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  styling: FileTypeStyle;
};

export type ResourceActionsProps = {
  resource: Resource;
  styling: FileTypeStyle;
  onPreview: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  user: User | null;
  folders: ResourceFolder[];
  showFolderMenu: boolean;
  setShowFolderMenu: (show: boolean) => void;
  optimisticFolderId: string | null;
  loadingFolder: boolean;
  handleAddToFolder: (folderId: string) => void;
};

export const fileTypeConfig: Record<string, FileTypeStyle> = {
  pdf: {
    bgColor:
      "bg-white hover:bg-red-50/50 dark:bg-gray-900 dark:hover:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    badgeColor:
      "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70",
    buttonColor:
      "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    previewBg:
      "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-red-50/50 dark:hover:bg-red-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-red-950/30",
  },
  docx: {
    bgColor:
      "bg-white hover:bg-blue-50/50 dark:bg-gray-900 dark:hover:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeColor:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70",
    buttonColor:
      "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    previewBg:
      "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-blue-950/30",
  },
  pptx: {
    bgColor:
      "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-950/70",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    badgeColor:
      "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/70",
    buttonColor:
      "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
    previewBg:
      "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-orange-50/50 dark:hover:bg-orange-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-orange-950/30",
  },
  xlsx: {
    bgColor:
      "bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-950/70",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    badgeColor:
      "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/70",
    buttonColor:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    previewBg:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-green-50/50 dark:hover:bg-green-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-green-950/30",
  },
  zip: {
    bgColor:
      "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-950/70",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeColor:
      "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/70",
    buttonColor:
      "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    previewBg:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-purple-950/30",
  },
  rar: {
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    previewBg:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-purple-950/30",
  },
  mp4: {
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    previewBg:
      "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-blue-950/30",
  },
  mp3: {
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-200",
    iconColor: "text-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    buttonColor: "bg-indigo-500 hover:bg-indigo-600",
    previewBg:
      "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-indigo-950/30",
  },
  jpg: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    previewBg:
      "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-amber-950/30",
  },
  png: {
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    previewBg:
      "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-amber-950/30",
  },
  default: {
    bgColor:
      "bg-white hover:bg-slate-50/50 dark:bg-gray-900 dark:hover:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    badgeColor:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900/70",
    buttonColor:
      "bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700",
    previewBg:
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50",
    cardBg: "bg-white dark:bg-gray-900",
    cardHoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-950/30",
    darkCardBg: "dark:bg-gray-900",
    darkCardHoverBg: "dark:hover:bg-slate-950/30",
  },
};
