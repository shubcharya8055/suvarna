"use client";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth: React.FC = () => {
	const emailId = useId();
	const passwordId = useId();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!supabase) {
			setError("Supabase client is not initialized. Check API keys.");
			return;
		}

		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
		}
		setLoading(false);
	};

	return (
		<div className="flex items-center justify-center py-12 px-4">
			<Card className="w-full max-w-md border-amber-200 shadow-xl">
				<div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-red-600 rounded-t-xl"></div>
				<CardHeader className="text-center space-y-2">
					<div className="mx-auto bg-amber-100 p-3 rounded-full w-fit">
						<Lock className="h-6 w-6 text-amber-700" />
					</div>
					<CardTitle className="text-2xl text-amber-900">
						Admin Access
					</CardTitle>
					<CardDescription>
						Secure login for Suvarna Sawari administrators
					</CardDescription>
				</CardHeader>

				<CardContent>
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
							<AlertCircle size={16} className="mt-0.5 shrink-0" />
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={emailId}>Email Address</Label>
							<Input
								id={emailId}
								type="email"
								required
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
								placeholder="admin@example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={passwordId}>Password</Label>
							<Input
								id={passwordId}
								type="password"
								required
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
						<Button
							type="submit"
							className="w-full bg-amber-800 hover:bg-amber-900"
							disabled={loading}
						>
							{loading ? (
								<span className="flex items-center gap-2">
									<Loader2 className="animate-spin h-4 w-4" /> Authenticating...
								</span>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="justify-center border-t border-amber-50 pt-4 pb-6">
					<p className="text-xs text-muted-foreground">
						Only authorized personnel may access records.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Auth;
