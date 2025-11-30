"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
	return {
		toast: (options: {
			variant?: "default" | "destructive" | "success";
			title?: string;
			description?: string;
		}) => {
			if (options.variant === "destructive") {
				sonnerToast.error(options.title || "Error", {
					description: options.description,
				});
			} else if (options.variant === "success") {
				sonnerToast.success(options.title || "Success", {
					description: options.description,
				});
			} else {
				sonnerToast.info(options.title || "Info", {
					description: options.description,
				});
			}
		},
	};
}

