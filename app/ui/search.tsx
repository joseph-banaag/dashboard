"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Search({ placeholder }: { placeholder: string }) {
	const searchParams = useSearchParams(); // this will get whatever the user is searching
	const pathname = usePathname(); // this is the current url path
	const { replace } = useRouter();

	function handleSearch(term: string) {
		const params = new URLSearchParams(searchParams);

		console.log(term);

		if (term) {
			params.set("query", term);
		} else {
			params.delete("query");
		}
		replace(`${pathname}?${params.toString()}`);

		// console.log(
		// 	"This is the pathname from the usePathname function: \n",
		// 	pathname,
		// );
		// console.log(
		// 	"This is the params from the URLSearchParams using useSearchParam not converted to str: \n",
		// 	params,
		// );
		// console.log("This is the searchParams value: ", searchParams);

		// console.log(
		// 	"This is the params from the URLSearchParams using useSearchParam CONVERTED to str: \n",
		// 	params.toString(),
		// );

		// console.log("Default value: ", searchParams.get("query")?.toString());
	}

	return (
		<div className="relative flex flex-1 flex-shrink-0">
			<label htmlFor="search" className="sr-only">
				Search
			</label>
			<input
				id="search"
				className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
				placeholder={placeholder}
				onChange={(event) => {
					handleSearch(event.target.value);
				}}
				defaultValue={searchParams.get("query")?.toString()}
			/>
			<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
		</div>
	);
}
