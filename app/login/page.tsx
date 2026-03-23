import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20">
          <div className="text-stardust/100 text-sm">Loading...</div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}