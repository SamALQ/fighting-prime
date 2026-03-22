import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { FAQList } from "@/components/ui/faq-list";
import { faqs } from "@/data/faq";
import { FAQJSONLD } from "@/components/seo/json-ld";

export default function FAQPage() {
  return (
    <MainLayout>
      <FAQJSONLD faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Everything you need to know about Fighting Prime Academy
            </p>
          </div>
          <FAQList faqs={faqs} />
        </div>
      </Section>
    </MainLayout>
  );
}
