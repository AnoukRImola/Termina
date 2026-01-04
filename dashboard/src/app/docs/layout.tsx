import { Sidebar } from '@/components/docs/Sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
