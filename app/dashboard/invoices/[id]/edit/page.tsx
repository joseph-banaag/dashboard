import Form from "@/app/ui/invoices/edit-form";  // The name Form can be named anything as long as the file path is correct.
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchInvoiceById, fetchCustomers } from "@/app/lib/data";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const id = params.id;
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers(),
	]);


	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ label: "Invoices", href: "/dashboard/invoices" },
					{
						label: "Edit Invoice",
						href: `/dashboard/invoices/${id}/edit`,
						active: true,
					},
				]}
			/>
			<Form invoice={invoice} customers={customers} />
		</main>
	);
}
