"use client";
import { Flower, LayoutList, LogOut, PlusCircle, Sun } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Auth from "./files/Auth";
import ProfileForm from "./files/ProfileForm";
import SubmitterCard from "./files/SubmitterCard";
import UserEntryForm from "./files/UserEntryForm";
import { createOrGetSubmitterSession } from "./lib/submitterSession";
import { type Session, supabase } from "./lib/supabaseClient";
import type { Submitter } from "./types";

const App: React.FC = () => {
	const [submitters, setSubmitters] = useState<Submitter[]>([]);
	const [session, setSession] = useState<Session | null>(null);
	const [activeTab, setActiveTab] = useState<string>("form");
	const [loading, setLoading] = useState(false);

	// User entry state
	const [submitterName, setSubmitterName] = useState<string>("");
	const [submitterMobile, setSubmitterMobile] = useState<string>("");
	const [showForm, setShowForm] = useState<boolean>(false);

	// Handle Auth Session
	useEffect(() => {
		if (supabase) {
			supabase.auth
				.getSession()
				.then(
					({ data: { session } }: { data: { session: Session | null } }) => {
						setSession(session);
						if (session) {
							setActiveTab("records");
						}
					},
				);

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange(
				(_event: string, session: Session | null) => {
					setSession(session);
					if (session && _event === "SIGNED_IN") {
						setActiveTab("records");
					} else if (!session) {
						setActiveTab("form");
					}
				},
			);

			return () => subscription.unsubscribe();
		}
	}, []);

	const fetchSubmitters = useCallback(async () => {
		if (!supabase) return;
		setLoading(true);

		const { data, error } = await supabase
			.from("profiles")
			.select("submitter_name, submitter_mobile")
			.not("submitter_name", "is", null)
			.not("submitter_mobile", "is", null);

		if (error) {
			console.error("Error fetching submitters:", error);
		} else if (data) {
			// Group by submitter_name and submitter_mobile
			const submitterMap = new Map<
				string,
				{ name: string; mobile: string; count: number }
			>();

			data.forEach(
				(item: { submitter_name: string; submitter_mobile: string }) => {
					// Only process items that have both name and mobile (not null/undefined)
					if (item.submitter_name && item.submitter_mobile) {
						const key = `${item.submitter_name}_${item.submitter_mobile}`;
						const existing = submitterMap.get(key);
						if (existing) {
							existing.count += 1;
						} else {
							submitterMap.set(key, {
								name: item.submitter_name.trim(),
								mobile: item.submitter_mobile.trim(),
								count: 1,
							});
						}
					} else {
						// Log items with missing data for debugging
						console.warn("Skipping item with missing submitter info:", item);
					}
				},
			);

			const submitterList: Submitter[] = Array.from(submitterMap.values())
				.filter((item) => item.name && item.mobile) // Ensure both name and mobile exist
				.map((item) => ({
					submitter_name: item.name,
					submitter_mobile: item.mobile,
					record_count: item.count,
				}));

			console.log("Filtered submitters list:", submitterList);
			setSubmitters(submitterList);
		}
		setLoading(false);
	}, []);

	// Fetch Submitters when records tab is active and authenticated
	useEffect(() => {
		if (activeTab === "records" && session) {
			fetchSubmitters();
		}
	}, [activeTab, session, fetchSubmitters]);

	const handleLogout = async () => {
		if (supabase) {
			await supabase.auth.signOut();
			setActiveTab("form");
		}
	};

	const handleUserEntry = async (name: string, mobile: string) => {
		// Store submitter session in Supabase backend
		const session = await createOrGetSubmitterSession(name, mobile);

		if (session) {
			setSubmitterName(session.submitter_name);
			setSubmitterMobile(session.submitter_mobile);
			setShowForm(true);
		} else {
			// Fallback: still allow form to show even if backend storage fails
			setSubmitterName(name);
			setSubmitterMobile(mobile);
			setShowForm(true);
		}
	};

	const handleFormSuccess = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		// Refresh submitters if on records tab
		if (activeTab === "records" && session) {
			fetchSubmitters();
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
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-amber-200 hover:bg-red-900/50 hover:text-white"
								title="Logout"
							>
								<LogOut size={18} />
							</Button>
						) : null}
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-amber-100/50">
						<TabsTrigger
							value="form"
							className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
						>
							<PlusCircle size={16} className="mr-2" />
							Add Details
						</TabsTrigger>
						{session ? (
							<TabsTrigger
								value="records"
								className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
							>
								<LayoutList size={16} className="mr-2" />
								Records
							</TabsTrigger>
						) : (
							<TabsTrigger
								value="auth"
								className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
							>
								<LayoutList size={16} className="mr-2" />
								Admin
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="form" className="animate-fade-in-up">
						{!showForm ? (
							<>
								<div className="text-center mb-8">
									<Flower className="mx-auto text-amber-600 mb-2 h-10 w-10 opacity-80" />
									<h2 className="text-3xl text-amber-900 serif-font font-bold">
										Welcome
									</h2>
									<p className="text-amber-800/70 mt-2 max-w-lg mx-auto">
										Please enter your details to continue to the submission
										form.
									</p>
								</div>
								<UserEntryForm onSubmit={handleUserEntry} />
							</>
						) : (
							<>
								<div className="text-center mb-8">
									<Flower className="mx-auto text-amber-600 mb-2 h-10 w-10 opacity-80" />
									<h2 className="text-3xl text-amber-900 serif-font font-bold">
										Submission Form
									</h2>
									<p className="text-amber-800/70 mt-2 max-w-lg mx-auto">
										Please fill out the form below to register yourself or a
										family member into the Suvarna Sawari community database.
									</p>
								</div>
								<ProfileForm
									submitterName={submitterName}
									submitterMobile={submitterMobile}
									onSuccess={handleFormSuccess}
								/>
							</>
						)}
					</TabsContent>

					<TabsContent value="auth" className="animate-fade-in-up">
						{!session && <Auth />}
					</TabsContent>

					<TabsContent value="records" className="animate-fade-in-up">
						{session && (
							<>
								<div className="flex items-center justify-between mb-8">
									<h2 className="text-2xl font-bold text-amber-900 serif-font">
										Registered Submitters
									</h2>
									<span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
										{submitters.length}{" "}
										{submitters.length === 1 ? "Submitter" : "Submitters"}
									</span>
								</div>

								{loading ? (
									<div className="flex justify-center items-center h-64">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
									</div>
								) : submitters.length === 0 ? (
									<div className="text-center py-20 bg-white/50 rounded-xl border border-amber-100">
										<p className="text-amber-800/60">
											No submitters found in the database.
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{submitters.map((submitter, index) => (
											<SubmitterCard
												key={`${submitter.submitter_name}_${submitter.submitter_mobile}_${index}`}
												submitter={submitter}
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
