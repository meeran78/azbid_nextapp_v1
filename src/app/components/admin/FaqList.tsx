import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFaqsForPublic } from "@/actions/faq.actions";
import { Card, CardTitle, CardContent,CardHeader} from "../ui/card";


const FaqList = async () => {
    
const faqItems = await getFaqsForPublic();

  if (!faqItems || faqItems.length === 0) {
    return <p className="text-sm text-muted-foreground">No FAQs available yet.</p>;
  }

  return (
    <Card className="mt-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
      {faqItems.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground whitespace-pre-line">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
          </CardContent>
    </Card>
    
  );
};

export default FaqList;