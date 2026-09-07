import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">AI Health Risk Prediction &amp; Telemedicine</h1>
      <p className="text-gray-600">
        Secure registration, remote consultation, and AI-generated risk indications for heart
        disease, diabetes and hypertension &mdash; in one platform.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Log in
        </Link>
        <Link href="/register" className="rounded-lg border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50">
          Register
        </Link>
      </div>
    </main>
  );
}
