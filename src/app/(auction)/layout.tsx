export default function BlogLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <section className='flex flex-col gap-4 bg-red-500'>{children}</section>
  }