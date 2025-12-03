"use client";
import { ArrowLeft, Flower } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProfileCard from "../../files/ProfileCard";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../types";

interface DatabaseProfile {
	id: string;
	name: string;
	relation: string;
	dob: string;
	nakshatra: string;
	rashi: string;
	contact_number: string;
	occupation: string;
	address: string;
	submitter_name: string;
	submitter_mobile: string;
}

interface SubmitterRecordsPageProps {
	params: Promise<{
		mobile: string;
	}>;
}

const SubmitterRecordsPage: React.FC<SubmitterRecordsPageProps> = ({
	params,
}) => {
	const router = useRouter();
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [submitterName, setSubmitterName] = useState<string>("");
	const [loading, setLoading] = useState(true);

	// Unwrap the params Promise using React.use()
	const resolvedParams = use(params);
	const [mobileNumber, setMobileNumber] = useState<string>("");

	// Extract mobile number from params once it's resolved
	useEffect(() => {
		if (resolvedParams?.mobile) {
			const decoded = decodeURIComponent(resolvedParams.mobile);
			setMobileNumber(decoded);
		}
	}, [resolvedParams?.mobile]);

	const fetchRecords = useCallback(async () => {
		if (!supabase || !mobileNumber) return;
		setLoading(true);

		// Check if mobile is undefined or invalid
		if (
			!mobileNumber ||
			mobileNumber === "undefined" ||
			mobileNumber === "null"
		) {
			console.error("Invalid mobile number:", mobileNumber);
			setLoading(false);
			return;
		}

		// Normalize mobile number - remove spaces, dashes, and other formatting
		const normalizeMobile = (mobile: string) => {
			return mobile
				.replace(/\s+/g, "")
				.replace(/[-+()]/g, "")
				.trim();
		};

		const normalizedMobile = normalizeMobile(mobileNumber);

		console.log(
			"Searching for mobile:",
			mobileNumber,
			"Normalized:",
			normalizedMobile,
		);

		// Try exact match first
		let { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("submitter_mobile", mobileNumber)
			.order("id", { ascending: true });

		// If no results with exact match, try fetching all and filtering
		if ((!data || data.length === 0) && !error) {
			console.log("Exact match failed, trying broader search...");
			// Get all profiles with submitter_mobile
			const { data: allData, error: allError } = await supabase
				.from("profiles")
				.select("*")
				.not("submitter_mobile", "is", null)
				.order("id", { ascending: true });

			if (allError) {
				console.error("Error fetching all profiles:", allError);
				error = allError;
			} else if (allData) {
				console.log("Total profiles with submitter_mobile:", allData.length);
				// Filter by normalized mobile number (handles formatting differences)
				const filtered = allData.filter((profile) => {
					if (!profile.submitter_mobile) return false;
					const profileMobile = normalizeMobile(profile.submitter_mobile);
					const matches = profileMobile === normalizedMobile;
					if (matches) {
						console.log(
							"Match found! Profile mobile:",
							profile.submitter_mobile,
							"Normalized:",
							profileMobile,
						);
					}
					return matches;
				});

				if (filtered.length > 0) {
					data = filtered;
					error = null;
					console.log(
						"Found",
						filtered.length,
						"matching records after normalization",
					);
				} else {
					// Debug: show what mobile numbers exist
					const uniqueMobiles = [
						...new Set(allData.map((p) => p.submitter_mobile)),
					];
					console.log("Available submitter_mobile values:", uniqueMobiles);
					console.log(
						"Searched for:",
						mobileNumber,
						"Normalized:",
						normalizedMobile,
					);
				}
			}
		}

		if (error) {
			console.error("Error fetching profiles:", error);
		} else if (data && data.length > 0) {
			console.log("Successfully found", data.length, "records");
			// Map DB columns (snake_case) to Frontend types (camelCase)
			const mappedProfiles: Profile[] = (data || []).map(
				(p: DatabaseProfile) => ({
					id: p.id,
					name: p.name,
					relation: p.relation,
					dob: p.dob,
					nakshatra: p.nakshatra,
					rashi: p.rashi,
					contactNumber: p.contact_number || "",
					occupation: p.occupation,
					address: p.address,
					submitter_name: p.submitter_name,
					submitter_mobile: p.submitter_mobile,
				}),
			);
			setProfiles(mappedProfiles);
			setSubmitterName(data[0].submitter_name || "");
		} else {
			console.warn(
				"No records found. Check console for available mobile numbers.",
			);
		}
		setLoading(false);
	}, [mobileNumber]);

	useEffect(() => {
		fetchRecords();
	}, [fetchRecords]);

	const handleDelete = async (id: string) => {
		if (!supabase) return;
		if (!confirm("Are you sure you want to delete this profile?")) return;

		const { error } = await supabase.from("profiles").delete().eq("id", id);
		if (error) {
			console.error("Error deleting profile:", error);
			alert("Failed to delete profile. Please try again.");
		} else {
			setProfiles(profiles.filter((p) => p.id !== id));
			fetchRecords();
		}
	};

	const handleUpdate = async (profile: Profile) => {
		if (!supabase) return;

		const { error } = await supabase
			.from("profiles")
			.update({
				name: profile.name,
				relation: profile.relation,
				dob: profile.dob,
				nakshatra: profile.nakshatra,
				rashi: profile.rashi,
				contact_number: profile.contactNumber,
				occupation: profile.occupation,
				address: profile.address,
			})
			.eq("id", profile.id);

		if (error) {
			console.error("Error updating profile:", error);
			alert("Failed to update profile. Please try again.");
		} else {
			setProfiles(profiles.map((p) => (p.id === profile.id ? profile : p)));
		}
	};

	return (
		<div className="min-h-screen pb-10 bg-[#fff7ed]">
			{/* Header */}
			<header className="bg-gradient-to-r from-red-800 via-amber-700 to-red-800 text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push("/")}
							className="text-amber-200 hover:bg-red-900/50 hover:text-white"
							title="Go back"
						>
							<ArrowLeft size={20} />
						</Button>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold tracking-tight serif-font text-amber-50">
								Records by {submitterName || "User"}
							</h1>
							<p className="text-xs md:text-sm text-amber-200 tracking-widest uppercase font-medium opacity-90">
								{mobileNumber || "Loading..."}
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				<div className="text-center mb-8">
					<Flower className="mx-auto text-amber-600 mb-2 h-10 w-10 opacity-80" />
					<h2 className="text-3xl text-amber-900 serif-font font-bold">
						Submitted Records
					</h2>
					<p className="text-amber-800/70 mt-2 max-w-lg mx-auto">
						All records submitted by {submitterName || "this user"}
					</p>
				</div>

				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
					</div>
				) : profiles.length === 0 ? (
					<div className="text-center py-20 bg-white/50 rounded-xl border border-amber-100">
						<p className="text-amber-800/60">
							No records found for this submitter.
						</p>
					</div>
				) : (
					<>
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-2xl font-bold text-amber-900 serif-font">
								Records
							</h2>
							<span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
								{profiles.length} {profiles.length === 1 ? "Entry" : "Entries"}
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{profiles.map((profile) => (
								<ProfileCard
									key={profile.id}
									profile={profile}
									onDelete={handleDelete}
									onUpdate={handleUpdate}
									onEdit={() => {}}
								/>
							))}
						</div>
					</>
				)}
			</main>

			{/* Footer */}
			<footer className="text-center py-8 text-amber-800/40 text-sm mt-auto">
				<p>
					&copy; {new Date().getFullYear()} Suvarna Sawari. All rights reserved.
				</p>
			</footer>
		</div>
	);
};

export default SubmitterRecordsPage;
