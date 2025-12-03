"use client";
import { Phone, User } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserEntryFormProps {
	onSubmit: (name: string, mobile: string) => Promise<void>;
}

const UserEntryForm: React.FC<UserEntryFormProps> = ({ onSubmit }) => {
	const nameId = useId();
	const mobileId = useId();
	const [name, setName] = useState("");
	const [mobile, setMobile] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		// Validation
		if (!name.trim()) {
			setError("Please enter your name");
			setLoading(false);
			return;
		}

		if (!mobile.trim()) {
			setError("Please enter your mobile number");
			setLoading(false);
			return;
		}

		// Basic mobile validation (at least 10 digits)
		const mobileDigits = mobile.replace(/\D/g, "");
		if (mobileDigits.length < 10) {
			setError("Please enter a valid mobile number (at least 10 digits)");
			setLoading(false);
			return;
		}

		try {
			await onSubmit(name.trim(), mobile.trim());
		} catch (err) {
			setError("Failed to save your information. Please try again.");
			console.error("Error submitting user entry:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative w-full max-w-md mx-auto">
			<Card className="border-2 border-amber-200 shadow-xl bg-[#fffdfa] relative z-10 overflow-hidden">
				<div className="h-2 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600"></div>

				<CardHeader className="text-center pb-2">
					<div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-2 border border-amber-200">
						<User className="text-amber-700" size={20} />
					</div>
					<CardTitle className="text-3xl text-amber-900">Welcome</CardTitle>
					<CardDescription className="text-amber-800/60 font-medium">
						Please enter your details to continue
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6 pt-4">
					<form onSubmit={handleSubmit} className="space-y-5">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor={nameId} className="text-amber-900">
								Full Name
							</Label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 h-4 w-4" />
								<Input
									id={nameId}
									type="text"
									placeholder="Enter your full name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={mobileId} className="text-amber-900">
								Mobile Number
							</Label>
							<div className="relative">
								<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 h-4 w-4" />
								<Input
									id={mobileId}
									type="tel"
									placeholder="Enter your mobile number"
									value={mobile}
									onChange={(e) => setMobile(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="pt-4">
							<Button
								type="submit"
								disabled={loading}
								className="w-full bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-800 hover:to-red-900 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
							>
								{loading ? "Saving..." : "Continue to Form"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserEntryForm;
