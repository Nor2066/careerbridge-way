import AuthListener from '@/components/AuthListener';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthListener />
      {children}
    </>
  );
}