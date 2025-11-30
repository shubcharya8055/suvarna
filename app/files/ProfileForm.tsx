"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Flower2, Scroll, Sparkles } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { supabase } from "../lib/supabaseClient";
import { Nakshatra, Rashi } from "../types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Validation schema
const profileFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must not exceed 100 characters")
		.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
	relation: z.string().min(1, "Please select a relation"),
	dob: z.string().min(1, "Date of birth is required"),
	nakshatra: z.string().min(1, "Please select a nakshatra"),
	rashi: z.string().min(1, "Please select a rashi"),
	contactNumber: z
		.string()
		.min(10, "Contact number must be at least 10 digits")
		.max(15, "Contact number must not exceed 15 digits")
		.regex(
			/^[\d\s+\-()]+$/,
			"Contact number can only contain digits, spaces, +, -, and parentheses",
		),
	occupation: z
		.string()
		.min(1, "Occupation is required")
		.max(100, "Occupation must not exceed 100 characters"),
	address: z
		.string()
		.min(10, "Address must be at least 10 characters")
		.max(500, "Address must not exceed 500 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
	initialData?: Partial<ProfileFormValues>;
	onSuccess: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	initialData,
	onSuccess,
}) => {
	const { toast } = useToast();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: initialData || {
			name: "",
			relation: "",
			dob: "",
			nakshatra: "",
			rashi: "",
			contactNumber: "",
			occupation: "",
			address: "",
		},
	});

	const onSubmit = async (data: ProfileFormValues) => {
		if (!supabase) {
			toast({
				variant: "destructive",
				title: "System Error",
				description: "Database not configured. Please check your settings.",
			});
			return;
		}

		try {
			const payload = {
				name: data.name,
				relation: data.relation,
				dob: data.dob,
				nakshatra: data.nakshatra,
				rashi: data.rashi,
				contact_number: data.contactNumber,
				occupation: data.occupation,
				address: data.address,
			};

			const { error } = await supabase.from("profiles").insert([payload]);

			if (error) throw error;

			toast({
				variant: "success",
				title: "Success!",
				description:
					"Details submitted successfully to the Suvarna Sawari registry.",
			});

			form.reset();
			setTimeout(() => {
				onSuccess();
			}, 1500);
		} catch (error) {
			console.error("Submission Error", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to submit details.";
			toast({
				variant: "destructive",
				title: "Submission Failed",
				description: errorMessage,
			});
		}
	};

	return (
		<div className="relative w-full max-w-2xl mx-auto">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 left-0 -translate-x-12 -translate-y-8 text-amber-500/10 pointer-events-none hidden md:block">
				<Flower2 size={160} />
			</div>
			<div className="absolute bottom-0 right-0 translate-x-12 translate-y-8 text-amber-500/10 pointer-events-none hidden md:block">
				<Flower2 size={160} />
			</div>

			<Card className="border-2 border-amber-200 shadow-xl bg-[#fffdfa] relative z-10 overflow-hidden">
				{/* Header Strip */}
				<div className="h-2 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600"></div>

				<CardHeader className="text-center pb-2">
					<div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-2 border border-amber-200">
						<Scroll className="text-amber-700" size={20} />
					</div>
					<CardTitle className="text-3xl text-amber-900">
						Submission Form
					</CardTitle>
					<CardDescription className="text-amber-800/60 font-medium">
						Enter details for the Suvarna Sawari Shishya Registry
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6 pt-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
							{/* Name & Relation */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g. Aarav Sharma" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="relation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Relation</FormLabel>
											<FormControl>
												<Input placeholder="e.g. Family, Shishya, Devotee, etc." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* DOB & Occupation */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="dob"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Date of Birth</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground"
															)}
														>
															{field.value ? (
																format(new Date(field.value), "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														captionLayout="dropdown"
														fromYear={1900}
														toYear={new Date().getFullYear()}
														selected={field.value ? new Date(field.value) : undefined}
														onSelect={(date) => {
															field.onChange(
																date ? format(date, "yyyy-MM-dd") : ""
															);
														}}
														disabled={(date) =>
															date > new Date() || date < new Date("1900-01-01")
														}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="occupation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Occupation</FormLabel>
											<FormControl>
												<Input placeholder="Profession / Seva" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Astro Details */}
							<div className="p-4 bg-amber-50 rounded-lg border border-amber-100 space-y-4">
								<h4 className="text-sm font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
									<Sparkles size={14} /> Spiritual Details
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="rashi"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Rashi (Zodiac)</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select Rashi" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(Rashi).map((r) => (
															<SelectItem key={r} value={r}>
																{r}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="nakshatra"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nakshatra</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select Nakshatra" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{Object.values(Nakshatra).map((n) => (
															<SelectItem key={n} value={n}>
																{n}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Contact & Address */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="contactNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contact Number</FormLabel>
											<FormControl>
												<Input
													type="tel"
													placeholder="+91 98765 43210"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl>
												<Textarea
													rows={3}
													placeholder="Residential address..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="pt-4">
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="w-full bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-800 hover:to-red-900 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
								>
									{form.formState.isSubmitting
										? "Submitting..."
										: "Submit Details"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfileForm;
