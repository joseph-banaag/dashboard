"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { string } from "zod/v4";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(["pending", "paid"]),
	date: z.string(),
});

// for creating invoice
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// for updating invoice
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

//CREATING INVOICE
export async function createInvoice(formData: FormData) {
	const { customerId, amount, status } = CreateInvoice.parse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];
	await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
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
export async function updateInvoice(id: string, formData: FormData) {
	const { customerId, amount, status } = UpdateInvoice.parse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	const amountInCents = amount * 100;
	await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
    WHERE id = ${id}
  `;
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
	await sql`
    DELETE FROM invoices WHERE id = ${id}`;

	revalidatePath("/dashboard/invoices");
}
