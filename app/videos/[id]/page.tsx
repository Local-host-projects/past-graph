import { Suspense } from "react";
import VideoStage from "@/components/VideoStage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VideoStage />
    </Suspense>
  );
}
