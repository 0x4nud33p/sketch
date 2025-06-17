export default function LoadingState() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#18181b]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#fef08a] border-t-transparent animate-spin" />
        <p className="text-[#fef08a] font-medium">Loading canvas...</p>
      </div>
    </div>
  );
}
