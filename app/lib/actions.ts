"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { string } from "zod/v4";
import { login } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: "Please select a customer.",
	}),
	amount: z.coerce
		.number()
		.gt(0, { message: "Please enter an amount greater than $0." }),
	status: z.enum(["pending", "paid"], {
		invalid_type_error: "Please select an invoice status.",
	}),
	date: z.string(),
});

// for creating invoice
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// for updating invoice
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

//CREATING INVOICE
export async function createInvoice(prevState: State, formData: FormData) {
	// validate form using zod
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	// if form validation failed, return errors only. Otherwise, continue,
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Create Invoice.",
		};
	}

	console.log(`This is the value of the validated fields: ${validatedFields}`);
	// prepare data for insertion into the database
	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	// insert data into the database
	try {
		await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
	} catch (error) {
		console.log("Encountered an error: ", error);
		return {
			message: "Database Error: Failed to Create Invoice",
		};
	}
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");

	// todo: create a toast here to tell user the update is done.

	const rawFormData = {
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	};
	console.log("This is the value of rawFormData: ", rawFormData);
}

//UPDATING INVOICE
export async function updateInvoice(
	id: string,
	prevState: State,
	formData: FormData,
) {
	const validatedFields = UpdateInvoice.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update Invoice",
		};
	}

	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;

	try {
		await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
    WHERE id = ${id}
  `;
	} catch (error) {
		console.log(error);
		return {
			message: "Database Error: Failed to Update Invoice",
		};
	}
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

//DELETING INVOICE
export async function deleteInvoice(id: string) {
	await sql`
    DELETE FROM invoices WHERE id = ${id}`;

	revalidatePath("/dashboard/invoices");
}

export async function authenticate(
	prevState: string | undefined,
	formData: FormData,
) {
	try {
		await login("credentials", formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return "Invalid Credentials.";
				default:
					return "Something went wrong.";
			}
		}
		throw error;
	}
}
