import Link from "next/link";

export default function Contact() {
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
          <Link href="/" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            Home
          </Link>
          <Link href="/about" className="text-dark-gray hover:text-golden-yellow transition-colors font-medium">
            About
          </Link>
          <Link href="/contact" className="text-golden-yellow font-medium">
            Contact
          </Link>
          <button className="bg-golden-yellow hover:bg-amber-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Sign In
          </button>
        </nav>
        <button className="md:hidden text-dark-gray" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-gray mb-4 font-montserrat">
              Contact <span className="text-golden-yellow">Us</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help you find the right materials for your construction projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-6 font-montserrat">Send Us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent"
                    placeholder="Tell us about your project or question..."
                    required
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-golden-yellow hover:bg-amber-500 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-dark-gray mb-6 font-montserrat">Contact Information</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-golden-yellow p-2 rounded-md mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-gray mb-1">Phone</h3>
                      <p className="text-gray-600">(303) 555-1234</p>
                      <p className="text-gray-500 text-sm mt-1">Monday-Friday, 8am-6pm MT</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-golden-yellow p-2 rounded-md mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-gray mb-1">Email</h3>
                      <p className="text-gray-600">info@supplystackconstruction.com</p>
                      <p className="text-gray-500 text-sm mt-1">We&apos;ll respond within 24 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-golden-yellow p-2 rounded-md mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-gray mb-1">Office</h3>
                      <p className="text-gray-600">1234 Construction Way</p>
                      <p className="text-gray-600">Denver, CO 80202</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" title="Facebook" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" title="Instagram" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" title="Twitter" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a href="#" title="LinkedIn" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark-gray mb-6 font-montserrat">Our Location</h2>
            <div className="bg-gray-200 rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600">Map view will be integrated with Google Maps API</p>
                <p className="text-gray-500 text-sm mt-2">1234 Construction Way, Denver, CO 80202</p>
              </div>
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
