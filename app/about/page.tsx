import Link from "next/link";

export default function About() {
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
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-dark-gray hover:text-golden-yellow transition-colors font-medium"
          >
            Home
          </Link>
          <Link href="/about" className="text-golden-yellow font-medium">
            About
          </Link>
          <Link
            href="/contact"
            className="text-dark-gray hover:text-golden-yellow transition-colors font-medium"
          >
            Contact
          </Link>
          <button className="bg-golden-yellow hover:bg-amber-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Sign In
          </button>
        </nav>
        <button className="md:hidden text-dark-gray" aria-label="Open menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-gray mb-4 font-montserrat">
              About <span className="text-golden-yellow">SupplyStack</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Revolutionizing how construction professionals find and source
              materials with real-time availability and competitive pricing.
            </p>
          </div>

          {/* Our Mission */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-dark-gray mb-6 font-montserrat">
              Our Mission
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <p className="text-gray-700 mb-4">
                At SupplyStack Construction, our mission is to streamline the
                construction material sourcing process, saving valuable time and
                resources for contractors, builders, and DIY enthusiasts alike.
              </p>
              <p className="text-gray-700">
                We believe that finding the right materials at the right price
                shouldn&apos;t be a challenge. Our platform connects you
                directly with suppliers, providing real-time inventory
                information, competitive pricing, and location-based results to
                make your projects run smoothly from start to finish.
              </p>
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-dark-gray mb-6 font-montserrat">
              Our Story
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 mb-4">
                  SupplyStack Construction was founded in 2023 by a team of
                  construction industry veterans and technology experts who
                  recognized a fundamental problem in the construction supply
                  chain.
                </p>
                <p className="text-gray-700 mb-4">
                  After experiencing firsthand the frustration of sourcing
                  materials across multiple vendors, making countless phone
                  calls to check availability, and driving from store to store
                  to compare prices, our founders decided there had to be a
                  better way.
                </p>
                <p className="text-gray-700">
                  Today, SupplyStack has grown into the premier platform for
                  construction material sourcing, serving thousands of
                  professionals across the country with our innovative
                  technology solutions.
                </p>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto mb-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p>Company Timeline Image</p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-dark-gray mb-6 font-montserrat">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team Member 1 */}
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-dark-gray mb-1">
                  Sarah Johnson
                </h3>
                <p className="text-golden-yellow font-medium mb-2">
                  CEO & Co-Founder
                </p>
                <p className="text-gray-600 text-sm">
                  Former construction project manager with 15+ years of
                  experience in the industry.
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-dark-gray mb-1">
                  Michael Chen
                </h3>
                <p className="text-golden-yellow font-medium mb-2">
                  CTO & Co-Founder
                </p>
                <p className="text-gray-600 text-sm">
                  Tech innovator with a background in supply chain management
                  systems.
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-dark-gray mb-1">
                  David Rodriguez
                </h3>
                <p className="text-golden-yellow font-medium mb-2">
                  Head of Partnerships
                </p>
                <p className="text-gray-600 text-sm">
                  Building relationships with suppliers and vendors across the
                  country.
                </p>
              </div>
            </div>
          </section>

          {/* Join Us */}
          <section className="bg-golden-yellow rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 font-montserrat">
              Join Our Network
            </h2>
            <p className="text-white text-lg mb-6 max-w-2xl mx-auto">
              Whether you&apos;re a contractor looking for materials or a supplier
              wanting to reach more customers, SupplyStack Construction has a
              solution for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-golden-yellow px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
              <button className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-colors">
                Become a Partner
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-gray">
              Supply<span className="text-golden-yellow">Stack</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Finding construction materials made easy.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  For Vendors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dark-gray">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-golden-yellow text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SupplyStack Construction. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
