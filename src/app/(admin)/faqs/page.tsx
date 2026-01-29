import FaqManager from '@/app/components/admin/FaqManager';

import { getAllFaqsForAdmin } from "@/actions/faq.actions";

const FaqsPage = async () => {
    const faqs = await getAllFaqsForAdmin(); // load from Prisma

  return (
    <div className='container mx-auto p-6 max-w-6xl space-y-6'>
        <FaqManager initialFaqs={faqs || []} />
    </div>
  )
}

export default FaqsPage