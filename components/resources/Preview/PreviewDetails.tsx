import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { PreviewDetailsProps } from "@/types/resource";

export function PreviewDetails({
  resource,
  FileIcon,
  styling,
}: PreviewDetailsProps) {
  return (
    <div
      className={cn(
        "w-full h-full overflow-y-auto p-4 sm:p-6 flex flex-col",
        styling.cardBg
      )}
    >
      <div className="space-y-6 flex-1">
        {/* Upload Information */}
        <div className="space-y-3">
          <h3
            className={cn(
              "text-lg font-semibold flex items-center gap-2 sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
              styling.previewBg
            )}
          >
            <span className={cn("h-5 w-5", styling.iconColor)}>
              <FileIcon />
            </span>
            Upload Information
          </h3>
          <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    resource.uploadedBy.avatar ||
                    "/placeholder.svg?height=48&width=48"
                  }
                  alt={resource.uploadedBy.name}
                  className={cn(
                    "h-12 w-12 rounded-full ring-2 ring-offset-2",
                    styling.borderColor
                  )}
                />
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 bg-green-500 h-3 w-3 rounded-full border-2",
                    styling.borderColor
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {resource.uploadedBy.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDistanceToNow(new Date(resource.uploadDate), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="space-y-3">
          <h3
            className={cn(
              "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
              styling.previewBg
            )}
          >
            File Information
          </h3>
          <div
            className={cn(
              "rounded-lg p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4",
              styling.bgColor
            )}
          >
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Type
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("h-4 w-4", styling.iconColor)}>
                  <FileIcon />
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {resource.fileType.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Size
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {resource.fileSize}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Category
              </span>
              <Badge variant="secondary" className={styling.badgeColor}>
                {resource.type}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Upload Date
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date(resource.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Department & Course */}
        <div className="space-y-3">
          <h3
            className={cn(
              "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
              styling.previewBg
            )}
          >
            Department & Course
          </h3>
          <div
            className={cn("rounded-lg p-4 shadow-sm space-y-3", styling.bgColor)}
          >
            {resource.department ? (
              <div className="space-y-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Department
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    styling.borderColor,
                    styling.iconColor
                  )}
                >
                  {resource.department}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No department specified
              </p>
            )}
            {resource.courseId && (
              <div className="space-y-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Course
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    styling.borderColor,
                    styling.iconColor
                  )}
                >
                  {resource.courseId}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="space-y-3">
            <h3
              className={cn(
                "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
                styling.previewBg
              )}
            >
              Tags
            </h3>
            <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "text-sm px-3 py-1",
                      styling.borderColor,
                      styling.iconColor
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-3">
          <h3
            className={cn(
              "text-lg font-semibold sticky top-0 py-2.5 px-2 border-b backdrop-blur-sm bg-opacity-95",
              styling.previewBg
            )}
          >
            Description
          </h3>
          <div className={cn("rounded-lg p-4 shadow-sm", styling.bgColor)}>
            <p className="text-sm leading-relaxed break-words text-gray-900 dark:text-gray-100">
              {resource.description || "No description available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}