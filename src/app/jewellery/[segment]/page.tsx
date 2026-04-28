import { redirect } from "next/navigation";

export default async function JewellerySegmentPage({ 
  params 
}: { 
  params: Promise<{ segment: string }> 
}) {
  const resolvedParams = await params;
  // Redirect to style selection directly as its the first step after segment selection
  redirect(`/jewellery/${resolvedParams.segment}/style`);
}
