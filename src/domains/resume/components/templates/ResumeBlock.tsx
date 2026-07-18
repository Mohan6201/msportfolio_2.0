// Shared wrapper for every repeating entry (experience, education, certification, project) in
// every template. Two jobs in one: `break-inside-avoid` stops the browser's real print engine
// from cutting an entry in half across a PDF page boundary, and `data-resume-block` gives
// PaginatedResumePreview.tsx a stable marker to measure so the on-screen preview's page breaks
// land in the same places the real PDF export's breaks do — without this, the live preview and
// the actual export could each break pages differently.
export default function ResumeBlock({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-resume-block className={`break-inside-avoid ${className}`}>
      {children}
    </div>
  );
}
