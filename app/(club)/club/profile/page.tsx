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
 </label>
<label className="block">
 <span className="text-sm font-semibold text-brand-ink">Meeting schedule</span>
 <Input className="mt-2" defaultValue={club?.meetingSchedule} />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Meeting location</span>
 <Input className="mt-2" defaultValue={club?.meetingLocation} />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Contact email</span>
 <Input className="mt-2" defaultValue={club?.contactEmail} />
 </label>
 <label className="block">
 <span className="text-sm font-semibold text-brand-ink">Description</span>
 <textarea
 className="mt-2 min-h-32 w-full rounded-[12px] border border-brand-mist bg-white px-3.5 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
 defaultValue={club?.description}
 />
 </label>
 <Button className="w-fit">
 <Save className="h-4 w-4" />
 Save changes
 </Button>
 </form>
 </CardContent>
 </Card>
 </div>
 );
}
