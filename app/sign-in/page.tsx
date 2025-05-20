import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-dark-gray font-montserrat">
              Supply<span className="text-golden-yellow">Stack</span>
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dark-gray mb-2 font-montserrat">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your SupplyStack account</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-golden-yellow hover:bg-amber-500 text-white",
                  footerActionLink: "text-golden-yellow hover:text-amber-500",
                }
              }}
              redirectUrl="/search"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-100">
        <p>&copy; {new Date().getFullYear()} SupplyStack Construction. All rights reserved.</p>
      </footer>
    </div>
  );
}
