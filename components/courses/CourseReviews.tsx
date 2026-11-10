"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ReviewModal } from "@/components/learning/ReviewModal";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { IconSpinner } from "@/components/auth/shared/icons";

type Review = {
  id: string;
  rating: number;
  review_text?: string;
  created_at?: string;
  reply_text?: string | null;
  reply_created_at?: string | null;
  user?: { first_name?: string; last_name?: string } | null;
};

interface CourseReviewsProps {
  courseId: string;
  /** Only a signed-in learner can have a review of their own to look up. */
  signedIn?: boolean;
}

export function CourseReviews({ courseId, signedIn = false }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const router = useRouter();

  const fetchReviews = useCallback(async (pageNumber: number) => {
    try {
      const res = await fetch(
        `/api/proxy/courses/${courseId}/reviews?page=${pageNumber}&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        // The API sends the list in `data` and the page count in `meta`.
        const items = Array.isArray(data?.data) ? data.data : data?.data?.items || [];
        setReviews(items);
        setTotalPages(data?.meta?.total_pages || data?.data?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchUserReview = useCallback(async () => {
    if (!signedIn) return;
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/reviews/me`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.id) {
          setUserReview(data.data);
        } else {
          setUserReview(null);
        }
      } else {
        setUserReview(null);
      }
    } catch (e) {
      console.error("Failed to fetch user review", e);
    }
  }, [courseId, signedIn]);

  // Load once the page has painted, and again whenever the page of reviews changes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchReviews(page);
      fetchUserReview();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page, fetchReviews, fetchUserReview]);

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    const idToDelete = reviewToDelete;
    setDeletingId(idToDelete);
    setReviewToDelete(null); // Close the modal immediately
    try {
      const res = await fetch(`/api/proxy/courses/reviews/${idToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Review deleted successfully");
        setUserReview(null);
        localStorage.removeItem(`has_reviewed_${courseId}`);
        fetchReviews(page);
        router.refresh();
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("An error occurred while deleting the review.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReviewUpdated = () => {
    fetchReviews(page);
    fetchUserReview();
    router.refresh();
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconSpinner className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show the section if there are no reviews at all
  }

  return (
    <div>
      <h2 className="sw-display m-0 mb-8 text-[clamp(1.8rem,3vw,2.5rem)] text-ink">
        What learners say
      </h2>

      <div className="space-y-6">
        {reviews.map((review) => {
          const isMine = userReview?.id === review.id;

          return (
            <div
              key={review.id}
              className={`p-6 md:p-7 rounded-[24px] border ${isMine ? 'border-gold bg-gold/10' : 'border-line bg-card'} transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mint flex items-center justify-center text-lg font-bold text-accent shrink-0">
                    {review.user?.first_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink">
                      {review.user?.first_name} {review.user?.last_name}
                      {isMine && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">You</span>}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-gold text-gold" : "fill-transparent text-ink-3/50"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-ink-3">
                        {new Date(review.created_at ?? "").toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {isMine && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-paper-2 transition-colors focus:outline-none">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        className="min-w-[160px] bg-card rounded-xl shadow-xl border border-line p-1 z-50 animate-in fade-in zoom-in-95"
                      >
                        <DropdownMenu.Item
                          onSelect={() => setIsReviewModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 rounded-lg hover:bg-paper-2 cursor-pointer outline-none"
                        >
                          <Pencil className="w-4 h-4" /> Edit Review
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setReviewToDelete(review.id)}
                          disabled={deletingId === review.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer outline-none focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-700"
                        >
                          {deletingId === review.id ? (
                            <IconSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete Review
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>

              {review.review_text && (
                <p className="text-ink-2 leading-relaxed text-[0.95rem]">
                  {review.review_text}
                </p>
              )}

              {review.reply_text && (
                <div className="mt-4 p-4 rounded-xl bg-paper-2 border border-line relative">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[0.65rem] font-bold shrink-0">
                      SW
                    </span>
                    <h5 className="font-bold text-sm text-ink flex items-center">
                      Social Work Nigeria
                      <span className="ml-2 text-[0.65rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52b788]/20 dark:text-[#52b788]">Team</span>
                    </h5>
                    {review.reply_created_at && (
                      <span className="text-xs text-ink-3 ml-auto hidden sm:block">
                        {new Date(review.reply_created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    {review.reply_text}
                  </p>
                  {review.reply_created_at && (
                    <span className="text-[0.65rem] text-ink-3 mt-2 block sm:hidden">
                      {new Date(review.reply_created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-ink-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reused Review Modal for Editing */}
      {userReview && (
        <ReviewModal
          courseId={courseId}
          isOpen={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          onDismiss={() => {}}
          existingReview={userReview}
          onReviewSubmitted={handleReviewUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-line bg-white dark:bg-[#0b1410] p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl text-center sm:text-left">
            <div className="flex flex-col space-y-2">
              <Dialog.Title className="text-xl font-bold tracking-tight text-ink">
                Delete Review?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ink-3">
                Are you sure you want to permanently delete your review? This action cannot be undone.
              </Dialog.Description>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 mt-4">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-paper-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 shadow-sm"
              >
                Delete
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 rounded-sm p-2 opacity-70 ring-offset-white dark:ring-offset-gray-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-ink-3"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
