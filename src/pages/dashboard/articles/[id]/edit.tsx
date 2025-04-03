import { useRouter } from "next/router";
import Link from "next/link";
import {
  useArticleById,
  useUpdateArticle,
  articleKeys,
} from "@/lib/services/articles/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import { updateArticleSchema } from "@/lib/api/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  showErrorToast,
  showSuccessToast,
  isApiError,
} from "@/lib/hooks/use-toast";
import { z } from "zod";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { authClient } from "@/lib/auth/client";
import { uploadFile } from "@/lib/services/upload";
import { queryClient } from "@/lib/query/client";

// Define the form values type using the schema
type ArticleFormValues = z.infer<typeof updateArticleSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: session } = authClient.useSession();

  // Get the article data
  const {
    data: article,
    isLoading: isLoadingArticle,
    error: articleError,
  } = useArticleById(id);

  // Check if user is the owner of the article
  const isOwner = article?.author?.id === session?.user?.id;

  // Redirect to dashboard if not the owner once data is loaded
  useEffect(() => {
    if (article && !isOwner) {
      showErrorToast("You don't have permission to edit this article");
      router.push("/dashboard");
    }
  }, [article, isOwner, router]);

  // Image upload hook
  const {
    selectedFile,
    imageResponse,
    isUploading,
    error: uploadError,
    handleFileSelected,
    reset: resetImageUpload,
  } = useImageUpload({
    initialImage: article?.coverImage, // Set initial image to the article's cover image
  });

  // Initialize the mutation with the article ID
  const updateArticleMutation = useUpdateArticle(id);

  // Add state for tracking form submission and image upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // Define form
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(updateArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      coverImage: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = form;

  // Set form values when article data is loaded
  useEffect(() => {
    if (article && isOwner) {
      reset({
        title: article.title,
        content: article.content,
        coverImage: article.coverImage || "",
      });
    }
  }, [article, isOwner, reset]);

  // Update the coverImage field when we get an image response
  useEffect(() => {
    if (imageResponse?.url) {
      const formValues = form.getValues();
      console.log(
        "Image response received:",
        imageResponse.url,
        "current value:",
        formValues.coverImage
      );

      // Only mark as changed if the URL is different from the article's original image
      if (imageResponse.url !== article?.coverImage) {
        setHasImageChanged(true);
        console.log(
          "Setting hasImageChanged to true - new URL differs from original"
        );
      }

      // Always update the form with the new image URL
      reset({ ...formValues, coverImage: imageResponse.url });
    }
  }, [imageResponse, reset, form, article]);

  // Ensure image is properly set when selectedFile exists
  useEffect(() => {
    // If we have a preview file but no coverImage value, it's in an inconsistent state
    if (selectedFile && !form.getValues().coverImage) {
      // Use existing response URL if available
      if (imageResponse?.url) {
        reset({ ...form.getValues(), coverImage: imageResponse.url });
      } else if (article?.coverImage) {
        // Keep using article's existing image if there's one
        reset({ ...form.getValues(), coverImage: article.coverImage });
      } else {
        // Mark that we have a file selected but not yet uploaded
        reset({ ...form.getValues(), coverImage: "pendingUpload" });
      }
    }
  }, [selectedFile, imageResponse, reset, form, article]);

  // Update the handleImageSelected function to better track image changes
  const handleImageSelected = (file: File | null) => {
    handleFileSelected(file);

    if (!file) {
      // Clear the coverImage value if the file is removed and an existing image was used
      if (article?.coverImage) {
        // Preserve the existing coverImage if it exists
        reset({ ...form.getValues(), coverImage: article.coverImage });
        setHasImageChanged(false);
      } else {
        reset({ ...form.getValues(), coverImage: "" });
      }
    } else {
      // Mark that the image has changed when a new file is selected
      setHasImageChanged(true);
      console.log("Image selected, marking as changed");
      // If selecting a file, set the coverImage to either the response URL or a temporary value
      reset({
        ...form.getValues(),
        coverImage:
          imageResponse?.url || article?.coverImage || "pendingUpload",
      });
    }
  };

  // Form submission handler
  const onSubmit = handleSubmit(async (values: ArticleFormValues) => {
    try {
      // Set submitting state to true
      setIsSubmitting(true);
      console.log(
        "Form submission started, selectedFile:",
        !!selectedFile,
        "hasImageChanged:",
        hasImageChanged
      );

      // Ensure user is the owner
      if (!isOwner) {
        showErrorToast("You don't have permission to edit this article");
        setIsSubmitting(false);
        return;
      }

      // If there's a selected file that hasn't been uploaded yet, upload it now
      if (selectedFile) {
        try {
          // Start the upload process
          setIsUploadingImage(true);
          console.log("Uploading selected file...");
          const uploadResponse = await uploadFile(selectedFile);
          // Set the cover image URL
          values.coverImage = uploadResponse.url;
          // Mark that the image has changed
          setHasImageChanged(true);
          console.log(
            "File uploaded successfully, new URL:",
            uploadResponse.url
          );
        } catch (error) {
          // If upload fails, show error and stop submission
          showErrorToast(
            error instanceof Error ? error.message : "Image upload failed"
          );
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Ensure cover image is provided and not the temporary value
      if (
        !values.coverImage ||
        values.coverImage === "pendingUpload" ||
        values.coverImage.trim() === ""
      ) {
        setError("coverImage", {
          type: "manual",
          message: "Cover image is required",
        });
        setIsSubmitting(false);
        return;
      }

      // Collect changes to send
      const updateData: Partial<ArticleFormValues> = {};

      // Only include changed fields
      if (values.title !== article?.title) {
        updateData.title = values.title;
      }

      if (values.content !== article?.content) {
        updateData.content = values.content;
      }

      // Always include coverImage in the update if it has been marked as changed
      // or if its value is different from the article's original coverImage
      if (hasImageChanged || values.coverImage !== article?.coverImage) {
        updateData.coverImage = values.coverImage;
        console.log(
          "Including image in update:",
          values.coverImage,
          "changed:",
          hasImageChanged,
          "different from original:",
          values.coverImage !== article?.coverImage
        );
      }

      // Force include coverImage if it exists and we had a selected file
      if (selectedFile && values.coverImage) {
        updateData.coverImage = values.coverImage;
        console.log(
          "Force including image due to file selection:",
          values.coverImage
        );
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        showSuccessToast("No changes were made to the article");
        setIsSubmitting(false);
        return;
      }

      console.log("Updating with data:", updateData);

      // Update the article with a fresh mutation
      await updateArticleMutation.mutateAsync(updateData);

      // Force cache update
      queryClient.setQueryData(articleKeys.detail(id), {
        ...article,
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      // Invalidate cache and refetch
      queryClient.invalidateQueries({
        queryKey: articleKeys.all,
        refetchType: "all",
      });
      await queryClient.refetchQueries({
        queryKey: articleKeys.detail(id),
      });

      // Show success message
      showSuccessToast("Article updated successfully");
      resetImageUpload();

      // Wait briefly for cache updates to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate back to the article
      router.push(`/dashboard/articles/${id}`);
    } catch (error) {
      console.error("Error during update:", error);
      if (isApiError(error) && error.field) {
        // Set field-specific error
        setError(error.field as keyof ArticleFormValues, {
          type: "server",
          message: error.message,
        });
      } else {
        // Show general error toast
        showErrorToast(error);
      }
      setIsSubmitting(false);
    }
  });

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: article?.title || "Article", href: `/dashboard/articles/${id}` },
    { label: "Edit" },
  ];

  // Show loading state while article data is loading
  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if article data failed to load
  if (articleError || !article) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <div className="bg-[#FFEBEE] text-[#B71C1C] p-8 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="font-medium">
              {articleError instanceof Error
                ? articleError.message
                : "Failed to load article data"}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is not the owner, show permission denied message
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <Header />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <div className="bg-[#FFEBEE] text-[#B71C1C] p-8 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-2">Permission Denied</h2>
            <p className="font-medium">
              You don&apos;t have permission to edit this article
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Is loading if either mutation is pending, form is submitting, or image is uploading
  const isLoading =
    updateArticleMutation.isPending || isSubmitting || isUploadingImage;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />

          <h1 className="text-2xl font-semibold text-[#3E2723] mb-6">
            Edit Article
          </h1>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[#5D4037]"
              >
                Title <span className="text-[#C62828]">*</span>
              </label>
              <input
                id="title"
                {...register("title")}
                className="mt-1 block w-full px-4 py-2 border border-[#D7CCC8] rounded-md shadow-sm focus:ring-[#8D6E63] focus:border-[#8D6E63] text-[#3E2723] font-medium"
                placeholder="Article Title"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-[#C62828] text-sm mt-1 font-medium">
                  {errors.title?.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-[#5D4037]"
              >
                Cover Image <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <ImageUpload
                  onImageSelected={handleImageSelected}
                  currentImageUrl={imageResponse?.url || article.coverImage}
                  className="mt-1"
                  isUploading={isUploading}
                  errorMessage={
                    uploadError?.message ||
                    errors.coverImage?.message?.toString()
                  }
                  required={true}
                />
                <input type="hidden" {...register("coverImage")} />
              </div>
              {errors.coverImage && (
                <p className="text-[#C62828] text-sm mt-1 font-medium">
                  {errors.coverImage?.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-[#5D4037]"
              >
                Content <span className="text-[#C62828]">*</span>
              </label>
              <textarea
                id="content"
                {...register("content")}
                rows={12}
                className="mt-1 block w-full px-4 py-2 border border-[#D7CCC8] rounded-md shadow-sm focus:ring-[#8D6E63] focus:border-[#8D6E63] text-[#3E2723] font-medium"
                placeholder="Write your article content here..."
                disabled={isLoading}
              ></textarea>
              {errors.content && (
                <p className="text-[#C62828] text-sm mt-1 font-medium">
                  {errors.content?.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/dashboard/articles/${id}`}
                className="px-4 py-2 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#5D4037] rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 bg-[#5D4037] text-white rounded-md text-sm font-medium ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#4E342E] cursor-pointer"
                } transition-colors flex items-center`}
              >
                {isLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                {isLoading ? "Saving Article..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession({
    headers: toWebHeaders(context.req.headers),
  });

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
