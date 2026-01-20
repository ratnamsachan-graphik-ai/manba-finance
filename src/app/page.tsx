import { LoanForm } from "@/components/loan-form";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image 
            src="https://ik.imagekit.io/wekwjyn8z/prosperity-finance-logo.webp"
            alt="Prosperity Finance Logo"
            width={200}
            height={50}
            className="object-contain"
            priority
          />
        </div>
        <LoanForm />
      </div>
    </main>
  );
}
