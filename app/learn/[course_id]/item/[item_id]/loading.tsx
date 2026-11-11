/** Shown in the lesson area while the next lesson loads; the outline stays put. */
export default function LessonLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-[880px] px-5 pb-16 pt-7 sm:px-8 sm:pt-9"
    >
      <span className="sr-only">Loading lesson</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="lms-skel h-3 w-32" />
        <div className="lms-skel h-11 w-[min(85%,34rem)]" />
        <div className="lms-skel h-4 w-48" />
        <div className="lms-skel mt-6 aspect-video w-full rounded-[16px]" />
        <div className="lms-skel mt-4 h-4 w-full" />
        <div className="lms-skel h-4 w-11/12" />
        <div className="lms-skel h-4 w-3/4" />
      </div>
    </div>
  );
}
