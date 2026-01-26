type Props = {
  params: Promise<{
    slug: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { slug } = await params;
   
  return (
    <div>
      Page {slug}
    </div>
  );
}

export default Page;