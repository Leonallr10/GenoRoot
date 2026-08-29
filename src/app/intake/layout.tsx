import { IntakeTranslationLoader } from "@/components/intake/IntakeTranslationLoader";

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return <IntakeTranslationLoader>{children}</IntakeTranslationLoader>;
}
