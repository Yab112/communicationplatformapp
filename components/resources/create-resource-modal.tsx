"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UploadIcon as FileUpload,
  X,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { years, fileTypes } from "@/data/mock/resources";
import { departments } from "@/constants/departments";
import { resourceFormSchema} from "@/lib/validator/resource";
import { useToast } from "@/hooks/use-toast";
import { useResourceStore } from "@/store/resource-store";
import { getCoursesForDepartment } from "@/constants/courses";

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateResourceModal({
  isOpen,
  onClose,
}: CreateResourceModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  const [isEnhancingTitle, setIsEnhancingTitle] = useState(false);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const { toast } = useToast();
  const { createResourceWithFile, enhanceText, isUploading } =
    useResourceStore();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      fileType: "",
      department: "",
      type: "",
      courseId: "",
    },
  });

  // Update available courses when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const courses = getCoursesForDepartment(selectedDepartment);
      setAvailableCourses(courses);
    } else {
      setAvailableCourses([]);
    }
  }, [selectedDepartment]);

  const handleSubmit = async (values: ResourceFormValues) => {
    event?.stopPropagation();
    console.log("Form submitted with values:", values);
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a file.",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await createResourceWithFile(
        values,
        selectedFile,
        selectedTags
      );
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      if (result.resource) {
        form.reset();
        setSelectedFile(null);
        setSelectedTags([]);
        setSelectedDepartment("");
        onClose(); // Notify parent to close modal and refresh
        toast({
          title: "Success",
          description: "Resource has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create resource. Please try again.",
        variant: "destructive",
      });
    } finally {
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Auto-detect file type
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension && fileTypes.includes(extension)) {
        form.setValue("fileType", extension);
      }
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Generic handler for both title and description enhancement
  const handleEnhanceField = async (
    field: "title" | "description",
    minLength: number,
    enhanceType: string,
    context: Record<string, string>
  ) => {
    const value = form.getValues(field);
    if (!value) {
      toast({
        title: `No ${field} to enhance`,
        description: `Please enter a ${field} first before enhancing.`,
        variant: "destructive",
      });
      return;
    }
    if (value.length < minLength) {
      toast({
        title: `${field.charAt(0).toUpperCase() + field.slice(1)} too short`,
        description: `Please write a bit more before enhancing.`,
        variant: "destructive",
      });
      return;
    }
    if (field === "title") setIsEnhancingTitle(true);
    if (field === "description") setIsEnhancingDescription(true);
    try {
      const result = await enhanceText(value, enhanceType, context);
      if (result.error) throw new Error(result.error);
      if (result.enhancedText) {
        const originalValue = value;
        form.setValue(field, result.enhancedText, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        toast({
          title: `${field.charAt(0).toUpperCase() + field.slice(1)} enhanced`,
          description: (
            <div className="flex flex-col gap-2">
              <p>Your {field} has been enhanced by AI.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue(field, originalValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  toast({
                    title: `${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    } reverted`,
                    description: `Your original ${field} has been restored.`,
                  });
                }}
              >
                Revert to original
              </Button>
            </div>
          ),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Could not enhance the ${field}`;
      if (
        errorMessage.includes("AI service is not configured") ||
        errorMessage.includes("AI API key is invalid")
      ) {
        toast({
          title: "AI Enhancement Unavailable",
          description:
            "The AI enhancement service is currently unavailable. Please try again later or contact support.",
          variant: "destructive",
        });
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch failed")
      ) {
        toast({
          title: "Connection Error",
          description:
            "Unable to connect to the enhancement service. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enhancement Failed",
          description: `Could not enhance the ${field}. Please try again.`,
          variant: "destructive",
        });
      }
    } finally {
      if (field === "title") setIsEnhancingTitle(false);
      if (field === "description") setIsEnhancingDescription(false);
    }
  };

  // Use the generic handler for both fields
  const handleEnhanceTitle = () =>
    handleEnhanceField("title", 3, "resource", {
      department: form.getValues("department"),
      resourceType: form.getValues("type"),
      fileType: form.getValues("fileType"),
    });
  const handleEnhanceDescription = () =>
    handleEnhanceField("description", 10, "post", {
      department: form.getValues("department"),
      resourceType: form.getValues("type"),
      fileType: form.getValues("fileType"),
      title: form.getValues("title"),
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              // Let's try every type of console message
              console.log("VALIDATION FAILED (Log):", errors);
              console.warn("VALIDATION FAILED (Warn):", errors);
              console.error("VALIDATION FAILED (Error):", errors);

              // This alert is impossible to miss. It will pause the browser.
              alert(
                "Validation Failed! See the console for the 'errors' object."
              );

              toast({
                title: "Invalid Form",
                description: "Please fill out all required fields correctly.",
                variant: "destructive",
              });
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter resource title"
                          {...field}
                          className="pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={handleEnhanceTitle}
                          disabled={isEnhancingTitle}
                        >
                          {isEnhancingTitle ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe the resource..."
                        className="min-h-[100px] resize-none pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancingDescription}
                      >
                        {isEnhancingDescription ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedDepartment(value);
                        form.setValue("courseId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.name} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedDepartment}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {years.map((year) => (
                  <Badge
                    key={year}
                    variant={
                      selectedTags.includes(year) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleTag(year)}
                  >
                    {year}
                  </Badge>
                ))}
                <Badge
                  variant={
                    selectedTags.includes("Exam") ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTag("Exam")}
                >
                  Exam
                </Badge>
                <Badge
                  variant={
                    selectedTags.includes("Assignment") ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTag("Assignment")}
                >
                  Assignment
                </Badge>
                <Badge
                  variant={
                    selectedTags.includes("Lecture") ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTag("Lecture")}
                >
                  Lecture
                </Badge>
                <Badge
                  variant={selectedTags.includes("Lab") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag("Lab")}
                >
                  Lab
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">File Upload</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted/50">
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <FileUpload className="h-10 w-10 text-primary mb-2" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, PPTX, XLSX, ZIP (max 10MB)
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.pptx,.xlsx,.zip"
                    />
                  </label>
                )}
              </div>
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {typeof form.formState.errors.root?.message === "string"
                    ? form.formState.errors.root.message
                    : ""}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="hover:bg-blue-50 hover:text-blue-600"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Resource"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
