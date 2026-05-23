import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import StyleEditorWrapper from '@/components/StyleEditorWrapper';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <StyleEditorWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}