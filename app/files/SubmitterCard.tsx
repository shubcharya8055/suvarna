import { Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Submitter } from "../types";

interface SubmitterCardProps {
	submitter: Submitter;
}

const SubmitterCard: React.FC<SubmitterCardProps> = ({ submitter }) => {
	const router = useRouter();

	const handleClick = () => {
		// Validate that submitter_mobile exists before navigating
		if (!submitter.submitter_mobile) {
			console.error("Submitter mobile is missing:", submitter);
			alert("Error: Mobile number not found for this submitter.");
			return;
		}

		// Navigate to the submitter's records page
		const encodedMobile = encodeURIComponent(submitter.submitter_mobile);
		router.push(`/submitter/${encodedMobile}`);
	};

	return (
		<Card
			className="overflow-hidden border-2 border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group bg-white cursor-pointer"
			onClick={handleClick}
		>
			<div className="bg-gradient-to-r from-amber-700 to-red-800 p-4 relative">
				<div className="absolute inset-0 bg-black opacity-10 pattern-dots"></div>
				<div className="relative z-10">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<div className="bg-black/20 p-1.5 rounded text-amber-200">
									<User size={16} />
								</div>
								<h3 className="text-xl font-bold text-amber-50 serif-font tracking-wide">
									{submitter.submitter_name}
								</h3>
							</div>
							<div className="flex items-center gap-2">
								<div className="bg-black/20 p-1.5 rounded text-amber-200">
									<Phone size={14} />
								</div>
								<span className="text-amber-200 text-sm">
									{submitter.submitter_mobile}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<CardContent className="p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs text-amber-500 uppercase font-bold tracking-widest mb-1">
							Records
						</p>
						<p className="text-2xl font-bold text-amber-900 serif-font">
							{submitter.record_count}
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="border-amber-300 text-amber-700 hover:bg-amber-50"
						onClick={(e) => {
							e.stopPropagation();
							handleClick();
						}}
					>
						View Records
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default SubmitterCard;
