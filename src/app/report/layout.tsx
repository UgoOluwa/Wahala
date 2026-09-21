import { LocaleProvider } from "@/components/LocaleProvider";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
