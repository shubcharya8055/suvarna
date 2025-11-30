import {
	Briefcase,
	Calendar,
	MapPin,
	Phone,
	Sparkles,
	Trash2,
} from "lucide-react";
import type React from "react";
import type { Profile } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
	profile: Profile;
	onDelete: (id: string) => void;
	onUpdate: (profile: Profile) => void;
	onEdit: (profile: Profile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onDelete }) => {
	const handleDelete = () => {
		onDelete(profile.id);
	};

	return (
		<Card className="overflow-hidden border-2 border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group bg-white">
			<div className="bg-gradient-to-r from-amber-700 to-red-800 p-4 relative">
				<div className="absolute inset-0 bg-black opacity-10 pattern-dots"></div>
				<div className="relative z-10 flex items-start justify-between">
					<div>
						<h3 className="text-xl font-bold text-amber-50 serif-font tracking-wide">
							{profile.name}
						</h3>
						<span className="inline-block bg-black/20 text-amber-200 text-xs px-2 py-0.5 rounded mt-1 backdrop-blur-sm border border-amber-500/30">
							{profile.relation}
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						className="text-amber-200 hover:bg-red-900/50 hover:text-white h-8 w-8"
						title="Delete profile"
					>
						<Trash2 size={16} />
					</Button>
				</div>
			</div>

			<CardContent className="p-5 space-y-4">
				{/* Contact & Job */}
				<div className="grid grid-cols-1 gap-2 text-sm text-amber-900/80">
					<div className="flex items-center gap-3">
						<div className="bg-amber-50 p-1.5 rounded text-amber-600">
							<Phone size={14} />
						</div>
						<span className="font-medium">{profile.contactNumber}</span>
					</div>
					{profile.occupation && (
						<div className="flex items-center gap-3">
							<div className="bg-amber-50 p-1.5 rounded text-amber-600">
								<Briefcase size={14} />
							</div>
							<span className="truncate">{profile.occupation}</span>
						</div>
					)}
					<div className="flex items-center gap-3">
						<div className="bg-amber-50 p-1.5 rounded text-amber-600">
							<Calendar size={14} />
						</div>
						<span>{new Date(profile.dob).toLocaleDateString()}</span>
					</div>
					<div className="flex items-start gap-3">
						<div className="bg-amber-50 p-1.5 rounded text-amber-600 mt-0.5">
							<MapPin size={14} />
						</div>
						<span className="line-clamp-2 leading-tight">
							{profile.address}
						</span>
					</div>
				</div>

				<div className="h-px bg-amber-100 my-2"></div>

				{/* Astro Stats */}
				<div className="bg-[#fffdf5] border border-amber-100 rounded-lg p-3 grid grid-cols-2 gap-4">
					<div>
						<p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">
							Rashi
						</p>
						<p className="text-sm font-bold text-amber-900 serif-font">
							{profile.rashi}
						</p>
					</div>
					<div>
						<p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">
							Nakshatra
						</p>
						<p className="text-sm font-bold text-amber-900 serif-font">
							{profile.nakshatra}
						</p>
					</div>
				</div>

				{/* AI Insight Section */}
				{profile.aiInsight && (
					<div className="pt-2">
						<div className="bg-purple-50 border border-purple-100 p-3 rounded-lg relative">
							<div className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full p-1 border border-purple-100 shadow-sm">
								<Sparkles size={14} />
							</div>
							<p className="text-sm text-purple-900 italic serif-font">
								"{profile.aiInsight}"
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ProfileCard;
