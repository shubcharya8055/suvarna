"use client";
import { Flower, LayoutList, LogOut, PlusCircle, Sun } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Auth from "./files/Auth";
import ProfileCard from "./files/ProfileCard";
import ProfileForm from "./files/ProfileForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { type Session, supabase } from "./lib/supabaseClient";
import type { Profile } from "./types";

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
}

const App: React.FC = () => {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [session, setSession] = useState<Session | null>(null);
	const [activeTab, setActiveTab] = useState<string>("form"); // Default to form tab
	const [loading, setLoading] = useState(false);

	// Handle Auth Session
	useEffect(() => {
		if (supabase) {
			supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
				setSession(session);
				// If user is logged in, switch to Records tab
				if (session) {
					setActiveTab("records");
				}
			});

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
				setSession(session);
				// When user logs in, switch to Records tab
				if (session && _event === "SIGNED_IN") {
					setActiveTab("records");
				} else if (!session) {
					setActiveTab("form");
				}
			});

			return () => subscription.unsubscribe();
		}
	}, []);

	const fetchProfiles = useCallback(async () => {
		if (!supabase) return;
		setLoading(true);
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.order("id", { ascending: true });

		if (error) {
			console.error("Error fetching profiles:", error);
		} else {
			// Map DB columns (snake_case) to Frontend types (camelCase)
			const mappedProfiles: Profile[] = (data || []).map(
				(p: DatabaseProfile) => ({
					id: p.id,
					name: p.name,
					relation: p.relation,
					dob: p.dob,
					nakshatra: p.nakshatra,
					rashi: p.rashi,
					contactNumber: p.contact_number,
					occupation: p.occupation,
					address: p.address,
				}),
			);
			setProfiles(mappedProfiles);
		}
		setLoading(false);
	}, []);

	// Fetch Profiles when records tab is active and authenticated
	useEffect(() => {
		if (activeTab === "records" && session) {
			fetchProfiles();
		}
	}, [activeTab, session, fetchProfiles]);

	const handleLogout = async () => {
		if (supabase) {
			await supabase.auth.signOut();
			setActiveTab("form");
		}
	};

	const handleFormSuccess = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id: string) => {
		if (!supabase || !session) return;
		if (!confirm("Are you sure you want to delete this profile?")) return;

		const { error } = await supabase.from("profiles").delete().eq("id", id);
		if (error) {
			console.error("Error deleting profile:", error);
			alert("Failed to delete profile. Please try again.");
		} else {
			setProfiles(profiles.filter((p) => p.id !== id));
		}
	};

	const handleUpdate = async (profile: Profile) => {
		if (!supabase || !session) return;

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
			{/* Sacred Header */}
			<header className="bg-gradient-to-r from-red-800 via-amber-700 to-red-800 text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="bg-amber-900/40 p-2.5 rounded-full border border-amber-400/30">
							<Sun size={32} className="text-amber-300 animate-pulse-slow" />
						</div>
						<div>
							<h1 className="text-2xl md:text-3xl font-bold tracking-tight serif-font text-amber-50">
								Suvarna Sawari
							</h1>
							<p className="text-xs md:text-sm text-amber-200 tracking-widest uppercase font-medium opacity-90">
								Shishya Hitam Registry
							</p>
						</div>
					</div>

					<nav className="flex items-center gap-2 bg-black/10 p-1.5 rounded-lg backdrop-blur-sm">
						{session ? (
							<>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleLogout}
									className="text-amber-200 hover:bg-red-900/50 hover:text-white"
									title="Logout"
								>
									<LogOut size={18} />
								</Button>
							</>
						) : null}
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-amber-100/50">
						<TabsTrigger value="form" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
							<PlusCircle size={16} className="mr-2" />
							Add Details
						</TabsTrigger>
						{session ? (
							<TabsTrigger value="records" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
								<LayoutList size={16} className="mr-2" />
								Records
							</TabsTrigger>
						) : (
							<TabsTrigger value="auth" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
								<LayoutList size={16} className="mr-2" />
								Admin
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="form" className="animate-fade-in-up">
						<div className="text-center mb-8">
							<Flower className="mx-auto text-amber-600 mb-2 h-10 w-10 opacity-80" />
							<h2 className="text-3xl text-amber-900 serif-font font-bold">
								Welcome
							</h2>
							<p className="text-amber-800/70 mt-2 max-w-lg mx-auto">
								Please fill out the form below to register yourself or a family
								member into the Suvarna Sawari community database.
							</p>
						</div>
						<ProfileForm onSuccess={handleFormSuccess} />
					</TabsContent>

					<TabsContent value="auth" className="animate-fade-in-up">
						{!session && <Auth />}
					</TabsContent>

					<TabsContent value="records" className="animate-fade-in-up">
						{session && (
							<>
								<div className="flex items-center justify-between mb-8">
									<h2 className="text-2xl font-bold text-amber-900 serif-font">
										Registered Disciples
									</h2>
									<span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
										{profiles.length} Entries
									</span>
								</div>

								{loading ? (
									<div className="flex justify-center items-center h-64">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
									</div>
								) : profiles.length === 0 ? (
									<div className="text-center py-20 bg-white/50 rounded-xl border border-amber-100">
										<p className="text-amber-800/60">
											No records found in the database.
										</p>
									</div>
								) : (
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
								)}
							</>
						)}
					</TabsContent>
				</Tabs>
			</main>

			{/* Footer */}
			<footer className="text-center py-8 text-amber-800/40 text-sm mt-auto">
				<p>
					&copy; {new Date().getFullYear()} Suvarna Sawari. All rights reserved.
				</p>
			</footer>

			{/* Toast Notifications */}
			<Toaster />
		</div>
	);
};

export default App;
