import { useRouter } from "next/router";
import Link from "next/link";
import { useCreateArticle } from "@/lib/services/articles/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import { createArticleSchema } from "@/lib/api/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  showErrorToast,
  showSuccessToast,
  isApiError,
} from "@/lib/hooks/use-toast";
import { z } from "zod";
import ImageUpload from "@/components/ImageUpload";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { uploadFile } from "@/lib/services/upload";
import { useEffect, useState } from "react";

// Define the type based on the schema
type ArticleFormValues = z.infer<typeof createArticleSchema>;

export default function NewArticlePage() {
  const router = useRouter();

  const {
    selectedFile,
    imageResponse,
    isUploading,
    error: uploadError,
    handleFileSelected,
    reset: resetImageUpload,
  } = useImageUpload();

  const createArticleMutation = useCreateArticle({
    onSuccess: () => {
      showSuccessToast("Article created successfully");
      resetImageUpload();
    },
    onError: (error: Error) => {
      showErrorToast(error);
    },
  });

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(createArticleSchema),
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
    setError,
    setValue,
  } = form;

  useEffect(() => {
    if (imageResponse?.url) {
      setValue("coverImage", imageResponse.url);
    }
  }, [imageResponse, setValue]);

  useEffect(() => {
    if (selectedFile && !form.getValues().coverImage) {
      if (imageResponse?.url) {
        setValue("coverImage", imageResponse.url);
      } else {
        setValue("coverImage", "pendingUpload");
      }
    }
  }, [selectedFile, imageResponse, setValue, form]);

  const handleImageSelected = (file: File | null) => {
    handleFileSelected(file);

    if (!file) {
      setValue("coverImage", "");
      return;
    }

    setValue("coverImage", imageResponse?.url || "pendingUpload");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      if (selectedFile) {
        try {
          setIsUploadingImage(true);
          const uploadResponse = await uploadFile(selectedFile);
          data.coverImage = uploadResponse.url;
        } catch (error) {
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

      if (!data.coverImage || data.coverImage.trim() === "") {
        setError("coverImage", {
          type: "manual",
          message: "Cover image is required",
        });
        setIsSubmitting(false);
        return;
      }

      const requestData: {
        title: string;
        content: string;
        coverImage: string;
      } = {
        title: data.title,
        content: data.content,
        coverImage: data.coverImage,
      };

      await createArticleMutation.mutateAsync(requestData);
      router.push("/dashboard");
    } catch (error) {
      if (isApiError(error) && error.field) {
        setError(error.field as keyof ArticleFormValues, {
          type: "server",
          message: error.message,
        });
      } else {
        showErrorToast(error);
      }
      setIsSubmitting(false);
    }
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "New Article" },
  ];

  const isLoading =
    createArticleMutation.isPending || isSubmitting || isUploadingImage;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />

          <h1 className="text-2xl font-semibold text-[#3E2723] mb-6">
            Create New Article
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
                  currentImageUrl={imageResponse?.url || ""}
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
                href="/dashboard"
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
                {isLoading ? "Creating Article..." : "Create Article"}
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
