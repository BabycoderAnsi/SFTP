import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - SFTP Gateway',
  description: 'Sign in to SFTP Gateway',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
