/** Shown inside the dashboard frame while a screen's data loads. */
export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-6"
    >
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="flex flex-col gap-3 pt-1">
        <div className="lms-skel h-3 w-28" />
        <div className="lms-skel h-10 w-[min(70%,22rem)]" />
        <div className="lms-skel h-4 w-[min(90%,30rem)]" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="lms-skel h-24 rounded-[24px]" />
        ))}
      </div>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="lms-card overflow-hidden">
            <div className="lms-skel aspect-[16/9] rounded-none" />
            <div className="flex flex-col gap-3 p-5">
              <div className="lms-skel h-5 w-4/5" />
              <div className="lms-skel h-4 w-3/5" />
              <div className="lms-skel mt-3 h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
