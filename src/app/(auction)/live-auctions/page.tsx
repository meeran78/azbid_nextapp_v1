import { ActiveLotsSection } from "@/app/components/ActiveLotsSection";

type HomeSearchParams = {
  q?: string;
  status?: string;
  location?: string;
  lot_q?: string;
  lot_status?: string;
  lot_location?: string;
  lot_item?: string;
  lot_category?: string;
};

type HomeProps = {
  searchParams: Promise<HomeSearchParams> | HomeSearchParams;
};

const LiveAuctions = ({ searchParams }: HomeProps) => {
  
  return (
    <ActiveLotsSection searchParams={searchParams} />
  )
}

export default LiveAuctions