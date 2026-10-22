// app/reset-password/layout.tsx
//
// Only here for the tab title: the page is a client component, which cannot
// export metadata itself.

import { pageMetadata } from '@/lib/i18n/server';

export function generateMetadata() {
  return pageMetadata('meta.resetPassword.title');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
