"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-50 to-gray-200">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6">
        Smart Vehicle Service
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl text-center">
        The ultimate platform for renting vehicles, managing garages, and tracking deliveries in real-time.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Login
        </Link>
        <Link href="/register" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Create Account
        </Link>
      </div>
    </div>
  );
}
