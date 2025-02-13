import { redirect } from "next/navigation";

export default function Home() {
  redirect("/canvas")
  return (
    <div className="bg-[#18181b]">
      <h1 className="text-red-400 text-bold ">
      Redirecting to canvas
    </h1>
    </div>
  );
}
