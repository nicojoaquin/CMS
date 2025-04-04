import { useRouter } from "next/router";
import Link from "next/link";
import {
  articleQueryKey,
  useArticleById,
  useUpdateArticle,
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
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getArticleById } from "@/lib/services/articles";
import GetArticleError from "../../../../components/articles/get-article-error";

type ArticleFormValues = z.infer<typeof updateArticleSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: session } = authClient.useSession();

  const { data: article, error: articleError } = useArticleById(id);

  const isOwner = article?.author?.id === session?.user?.id;

  const {
    selectedFile,
    imageResponse,
    isUploading,
    error: uploadError,
    handleFileSelected,
    reset: resetImageUpload,
  } = useImageUpload({
    initialImage: article?.coverImage,
  });

  const updateArticleMutation = useUpdateArticle(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);

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

  useEffect(() => {
    if (article && isOwner) {
      reset({
        title: article.title,
        content: article.content,
        coverImage: article.coverImage || "",
      });
    }
  }, [article, isOwner, reset]);

  useEffect(() => {
    if (imageResponse?.url) {
      const formValues = form.getValues();
      console.log(
        "Image response received:",
        imageResponse.url,
        "current value:",
        formValues.coverImage
      );

      if (imageResponse.url !== article?.coverImage) {
        setHasImageChanged(true);
        console.log(
          "Setting hasImageChanged to true - new URL differs from original"
        );
      }

      reset({ ...formValues, coverImage: imageResponse.url });
    }
  }, [imageResponse, reset, form, article]);

  useEffect(() => {
    if (selectedFile && !form.getValues().coverImage) {
      if (imageResponse?.url) {
        reset({ ...form.getValues(), coverImage: imageResponse.url });
      } else if (article?.coverImage) {
        reset({ ...form.getValues(), coverImage: article.coverImage });
      } else {
        reset({ ...form.getValues(), coverImage: "pendingUpload" });
      }
    }
  }, [selectedFile, imageResponse, reset, form, article]);

  const handleImageSelected = (file: File | null) => {
    handleFileSelected(file);

    if (!file) {
      if (article?.coverImage) {
        reset({ ...form.getValues(), coverImage: article.coverImage });
        setHasImageChanged(false);
      } else {
        reset({ ...form.getValues(), coverImage: "" });
      }
    } else {
      setHasImageChanged(true);
      reset({
        ...form.getValues(),
        coverImage:
          imageResponse?.url || article?.coverImage || "pendingUpload",
      });
    }
  };

  const onSubmit = handleSubmit(async (values: ArticleFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedFile) {
        try {
          setIsUploadingImage(true);
          const uploadResponse = await uploadFile(selectedFile);
          values.coverImage = uploadResponse.url;
          setHasImageChanged(true);
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

      const updateData: Partial<ArticleFormValues> = {};

      if (values.title !== article?.title) {
        updateData.title = values.title;
      }

      if (values.content !== article?.content) {
        updateData.content = values.content;
      }

      if (hasImageChanged || values.coverImage !== article?.coverImage)
        updateData.coverImage = values.coverImage;

      if (selectedFile && values.coverImage)
        updateData.coverImage = values.coverImage;

      if (Object.keys(updateData).length === 0) {
        showSuccessToast("No changes were made to the article");
        setIsSubmitting(false);
        return;
      }

      await updateArticleMutation.mutateAsync(updateData);
      showSuccessToast("Article updated successfully");
      resetImageUpload();

      router.push(`/dashboard/articles/${id}`);
    } catch (error) {
      console.error("Error during update:", error);
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
    { label: article?.title || "Article", href: `/dashboard/articles/${id}` },
    { label: "Edit" },
  ];

  if (articleError || !article) {
    return (
      <GetArticleError
        message={
          articleError instanceof Error
            ? articleError.message
            : "Failed to load article data"
        }
      />
    );
  }

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

  const queryClient = new QueryClient();
  const id = context.params?.id as string;

  try {
    await queryClient.prefetchQuery({
      queryKey: articleQueryKey(id),
      queryFn: () => getArticleById(id),
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (error) {
    console.log({ error });

    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
};
