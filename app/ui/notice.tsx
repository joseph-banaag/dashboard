import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["200", "300"],
  subsets: ["latin"],
});
export function Notice() {
  return (
    <p className={`${montserrat.className} text-xs antialiased`}>
      This has 3 seconds delay...
    </p>
  );
}
