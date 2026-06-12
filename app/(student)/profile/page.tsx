import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { clubs, currentStudent } from "@/lib/mock-data";
export default function ProfilePage() {
 const joinedClubs = clubs.filter((club) => currentStudent.joinedClubIds.includes(club.id));
 const initials = currentStudent.displayName
 .split(" ")
 .map((n) => n[0])
 .join("");
 return (
 <div className="space-y-8">
 <PageHeader
 eyebrow="Student Profile"
 title={currentStudent.displayName}
 description="Manage the student details and interests used across RamLink."
 />