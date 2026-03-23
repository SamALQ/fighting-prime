import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { FAQList } from "@/components/ui/faq-list";
import { fetchFaqs } from "@/lib/db";
import { FAQJSONLD } from "@/components/seo/json-ld";

export default async function FAQPage() {
  const faqs = await fetchFaqs();

  return (
    <MainLayout>
      <FAQJSONLD faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
      <Section className="relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
              Support
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-foreground/50 text-lg">
              Everything you need to know about Fighting Prime Academy
            </p>
          </div>
          <FAQList faqs={faqs} />
        </div>
      </Section>
    </MainLayout>
  );
}
