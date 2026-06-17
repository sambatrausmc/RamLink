import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getClubById } from "@/lib/mock-data";
export default function ClubProfileManagementPage() {
 const club = getClubById("cs-club");
 return (
 <div className="space-y-8">
 <PageHeader
 eyebrow="Club Profile"
 title="Manage public club information"
 description="These fields map to the public club profile students see in the directory."
 />
 <Card>
 <CardContent>
 <form className="grid gap-5">
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Club name</span>
 <Input className="mt-2" defaultValue={club?.name} />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Category</span>
 <Input className="mt-2" defaultValue={club?.category} />
 </label