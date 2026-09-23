import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
	weight: ["400", "700"],
	subsets: ["latin"],
});

export default function NoResults() {
	return (
		<div
			className={`${montserrat.className} text-sm font-bold flex justify-center align-middle pt-40 pb-40 antialiased text-slate-700`}
		>
			No records found...
		</div>
	);
}
