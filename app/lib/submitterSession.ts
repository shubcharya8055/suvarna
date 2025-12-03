import { supabase } from "./supabaseClient";

export interface SubmitterSession {
	id?: string;
	submitter_name: string;
	submitter_mobile: string;
	created_at?: string;
	last_active_at?: string;
}

/**
 * Create or retrieve a submitter session from Supabase
 * This stores the submitter info in the backend
 */
export async function createOrGetSubmitterSession(
	name: string,
	mobile: string,
): Promise<SubmitterSession | null> {
	if (!supabase) {
		console.error("Supabase client not initialized");
		return null;
	}

	try {
		// First, try to find an existing session for this name and mobile
		const { data: existing, error: findError } = await supabase
			.from("submitter_sessions")
			.select("*")
			.eq("submitter_name", name)
			.eq("submitter_mobile", mobile)
			.order("last_active_at", { ascending: false })
			.limit(1)
			.single();

		if (existing && !findError) {
			// Update last_active_at
			const { data: updated } = await supabase
				.from("submitter_sessions")
				.update({ last_active_at: new Date().toISOString() })
				.eq("id", existing.id)
				.select()
				.single();

			return updated || existing;
		}

		// If no existing session, create a new one
		const { data: newSession, error: insertError } = await supabase
			.from("submitter_sessions")
			.insert({
				submitter_name: name,
				submitter_mobile: mobile,
				created_at: new Date().toISOString(),
				last_active_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (insertError) {
			// If table doesn't exist, we'll fall back to using profiles table
			console.warn("submitter_sessions table may not exist:", insertError);
			return {
				submitter_name: name,
				submitter_mobile: mobile,
			};
		}

		return newSession;
	} catch (error) {
		console.error("Error creating/retrieving submitter session:", error);
		// Fallback: return the session data even if DB operation fails
		return {
			submitter_name: name,
			submitter_mobile: mobile,
		};
	}
}

/**
 * Get the current submitter session from Supabase
 * This retrieves the most recent active session
 */
export async function getSubmitterSession(
	name: string,
	mobile: string,
): Promise<SubmitterSession | null> {
	if (!supabase) {
		return null;
	}

	try {
		const { data, error } = await supabase
			.from("submitter_sessions")
			.select("*")
			.eq("submitter_name", name)
			.eq("submitter_mobile", mobile)
			.order("last_active_at", { ascending: false })
			.limit(1)
			.single();

		if (error || !data) {
			// Fallback: check profiles table for recent submissions
			const { data: profileData } = await supabase
				.from("profiles")
				.select("submitter_name, submitter_mobile")
				.eq("submitter_name", name)
				.eq("submitter_mobile", mobile)
				.order("id", { ascending: false })
				.limit(1)
				.single();

			if (profileData) {
				return {
					submitter_name: profileData.submitter_name,
					submitter_mobile: profileData.submitter_mobile,
				};
			}

			return null;
		}

		return data;
	} catch (error) {
		console.error("Error getting submitter session:", error);
		return null;
	}
}

