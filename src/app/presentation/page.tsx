import AiPresentation from "@/components/ai-presentation";
import { Suspense } from "react";

export default function page() {
    return <Suspense fallback={<div>Loading presentation</div>}><AiPresentation /></Suspense>;
}