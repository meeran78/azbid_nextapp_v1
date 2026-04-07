import { SellerContractAcknowledgementForm } from "@/app/components/SellerContractAcknowledgementForm";
import { redirect } from "next/navigation";

type Props = {
  searchParams:
    | Promise<{ token?: string }>
    | { token?: string };
};

export default async function SellerAckPage({ searchParams }: Props) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const token = params?.token;
  if (!token) redirect("/how-to-sell");

  return (
    <div className="container mx-auto px-4 py-16">
      <SellerContractAcknowledgementForm token={token} />
    </div>
  );
}
