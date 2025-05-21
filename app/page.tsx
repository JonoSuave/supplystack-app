import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import HomeSearchBar from "@/components/HomeSearchBar";
import SyncButton from "@/components/SyncButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-dark-gray font-montserrat">Supply<span className="text-golden-yellow">Stack</span></h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            Home
          </Link>
          <Link href="/materials" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            Materials
          </Link>
          <Link href="/search" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            Search
          </Link>
          <Link href="/about" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            About
          </Link>
          <Link href="/contact" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            Contact
          </Link>
          <div className="flex items-center space-x-4">
            <SyncButton size="sm" variant="outline" className="mr-2" />
            <SignInButton mode="modal">
              <button className="bg-golden-yellow hover:bg-amber-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="border border-golden-yellow text-golden-yellow hover:bg-golden-yellow hover:text-white px-4 py-2 rounded-md font-medium transition-colors">
                Sign Up
              </button>
            </SignUpButton>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
        <button className="md:hidden text-dark-gray" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-12 py-12 md:py-24">
        <div className="max-w-5xl w-full text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-dark-gray mb-6 font-montserrat leading-tight">
            Find Construction Materials <span className="text-golden-yellow">Faster</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto font-proxima-nova">
            Search across multiple vendors to find the best prices and availability for construction materials in your area.
          </p>
          
          {/* Search Bar Component */}
          <div className="w-full max-w-3xl mx-auto mb-10">
            <HomeSearchBar />
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-golden-yellow mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-gray">Real-time Availability</h3>
              <p className="text-gray-600">Get up-to-date information on material availability from multiple vendors.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-golden-yellow mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-gray">Location-based Results</h3>
              <p className="text-gray-600">Find materials near you with our geolocation-based search functionality.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-golden-yellow mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-dark-gray">Price Comparison</h3>
              <p className="text-gray-600">Compare prices across vendors to get the best deal for your project.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-gray">Supply<span className="text-golden-yellow">Stack</span></h3>
            <p className="text-gray-600 text-sm">Finding construction materials made easy.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-golden-yellow text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-golden-yellow text-sm">Contact</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-golden-yellow text-sm">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-gray-600 hover:text-golden-yellow text-sm">Blog</Link></li>
              <li><Link href="/help" className="text-gray-600 hover:text-golden-yellow text-sm">Help Center</Link></li>
              <li><Link href="/vendors" className="text-gray-600 hover:text-golden-yellow text-sm">For Vendors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-golden-yellow text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-golden-yellow text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} SupplyStack Construction. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
