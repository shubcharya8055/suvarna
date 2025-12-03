"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Scroll, Sparkles, Trash2 } from "lucide-react";
import type React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
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
import { supabase } from "../lib/supabaseClient";
import { Nakshatra, Rashi } from "../types";

// Validation schema for a single record
const recordSchema = z.object({
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
		.optional()
		.refine(
			(val) => !val || val.length === 0 || /^[\d\s+\-()]+$/.test(val),
			"Contact number can only contain digits, spaces, +, -, and parentheses",
		)
		.refine(
			(val) => !val || val.length === 0 || val.replace(/\D/g, "").length >= 10,
			"Contact number must be at least 10 digits",
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

// Form schema with array of records
const profileFormSchema = z.object({
	records: z.array(recordSchema).min(1, "At least one record is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
	submitterName: string;
	submitterMobile: string;
	onSuccess: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	submitterName,
	submitterMobile,
	onSuccess,
}) => {
	const { toast } = useToast();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			records: [
				{
					name: "",
					relation: "",
					dob: "",
					nakshatra: "",
					rashi: "",
					contactNumber: "",
					occupation: "",
					address: "",
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "records",
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
			// Validate submitter info before submitting
			if (!submitterName || !submitterMobile) {
				toast({
					variant: "destructive",
					title: "Submission Error",
					description:
						"Submitter information is missing. Please refresh the page and try again.",
				});
				console.error("Submitter info missing:", {
					submitterName,
					submitterMobile,
				});
				return;
			}

			const payloads = data.records.map((record) => ({
				name: record.name,
				relation: record.relation,
				dob: record.dob,
				nakshatra: record.nakshatra,
				rashi: record.rashi,
				contact_number: record.contactNumber || null,
				occupation: record.occupation,
				address: record.address,
				submitter_name: submitterName.trim(),
				submitter_mobile: submitterMobile.trim(),
			}));

			console.log("Submitting records with submitter info:", {
				submitter_name: submitterName,
				submitter_mobile: submitterMobile,
				recordCount: payloads.length,
			});

			const { error } = await supabase.from("profiles").insert(payloads);

			if (error) throw error;

			toast({
				variant: "success",
				title: "Success!",
				description: `${data.records.length} record(s) submitted successfully to the Suvarna Sawari registry.`,
			});

			form.reset({
				records: [
					{
						name: "",
						relation: "",
						dob: "",
						nakshatra: "",
						rashi: "",
						contactNumber: "",
						occupation: "",
						address: "",
					},
				],
			});
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

	const addMore = () => {
		append({
			name: "",
			relation: "",
			dob: "",
			nakshatra: "",
			rashi: "",
			contactNumber: "",
			occupation: "",
			address: "",
		});
	};

	return (
		<div className="relative w-full max-w-4xl mx-auto">
			<Card className="border-2 border-amber-200 shadow-xl bg-[#fffdfa] relative z-10 overflow-hidden">
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
					<div className="mt-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
						Submitting as: <strong>{submitterName}</strong> ({submitterMobile})
					</div>
				</CardHeader>

				<CardContent className="space-y-6 pt-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="border-2 border-amber-100 rounded-lg p-6 bg-white/50 space-y-5 relative"
								>
									{fields.length > 1 && (
										<div className="absolute top-4 right-4">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => remove(index)}
												className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
												title="Remove this record"
											>
												<Trash2 size={16} />
											</Button>
										</div>
									)}
									<div className="mb-4 pb-3 border-b border-amber-200">
										<h3 className="text-lg font-semibold text-amber-900">
											Record {index + 1}
										</h3>
									</div>

									{/* Name & Relation */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name={`records.${index}.name`}
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
											name={`records.${index}.relation`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Relation</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g. Family, Shishya, Devotee, etc."
															{...field}
														/>
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
											name={`records.${index}.dob`}
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
																		!field.value && "text-muted-foreground",
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
														<PopoverContent
															className="w-auto p-0"
															align="start"
														>
															<Calendar
																mode="single"
																captionLayout="dropdown"
																fromYear={1900}
																toYear={new Date().getFullYear()}
																selected={
																	field.value
																		? new Date(field.value)
																		: undefined
																}
																onSelect={(date) => {
																	field.onChange(
																		date ? format(date, "yyyy-MM-dd") : "",
																	);
																}}
																disabled={(date) =>
																	date > new Date() ||
																	date < new Date("1900-01-01")
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
											name={`records.${index}.occupation`}
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
												name={`records.${index}.rashi`}
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
												name={`records.${index}.nakshatra`}
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
											name={`records.${index}.contactNumber`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Contact Number{" "}
														<span className="text-amber-600 text-xs">
															(Optional)
														</span>
													</FormLabel>
													<FormControl>
														<Input
															type="tel"
															placeholder="+91 98765 43210 (Optional)"
															{...field}
															value={field.value || ""}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name={`records.${index}.address`}
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
								</div>
							))}

							<div className="flex flex-col sm:flex-row gap-4 pt-4">
								<Button
									type="button"
									onClick={addMore}
									variant="outline"
									className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
								>
									<Plus size={16} className="mr-2" />
									Add More Record
								</Button>
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="flex-1 bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-800 hover:to-red-900 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
								>
									{form.formState.isSubmitting
										? "Submitting..."
										: `Submit ${fields.length} Record(s)`}
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
