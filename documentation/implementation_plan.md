# Implementation plan

## Phase 1: Environment Setup

1.  **Step 1: Verify Node.js Installation**

    - Check if Node.js v20.2.1 is installed using `node -v`.
    - If not installed, install Node.js v20.2.1 as required by our project (**Tech Stack: Core Tools**).

2.  **Step 2: Verify Python Installation**

    - Check if Python 3.11.4 is installed using `python --version`.
    - If not, install Python 3.11.4 (if needed for auxiliary scripts) (**Tech Stack: Core Tools**).

3.  **Step 3: Initialize Git Repository**

    - Create the project directory (e.g., `supplystack-app`).
    - Run `git init` inside the project folder and create branches `main` and `dev`. Enforce branch protection rules in GitHub (**PRD: App Overview & Infrastructure**).

4.  **Step 4: Set Up CodeGuide Starter Pro Template**

    - Visit the CodeGuide Starter Pro repository with Windsurf IDE and create a new repository using the template (**Tech Stack: Development Tools**).

5.  **Step 5: Install Next.js 14 (Exact Version)**

    - Using the terminal, run: `npx create-next-app@14 --typescript` to initialize the Next.js project in the project folder (**Tech Stack: Frontend**).
    - **Note:** We must use Next.js 14 as it is better suited with current AI coding tools and LLM models.

6.  **Step 6: Install Tailwind CSS and Shadcn UI**

    - Follow the Tailwind CSS setup guide for Next.js and install Tailwind CSS into the project.
    - Install Shadcn UI components as per their integration documentation (**Tech Stack: Frontend**).

7.  **Validation:**

    - Run `node -v` and `npx next --version` to confirm Node.js and Next.js 14 are setup correctly.

## Phase 2: Frontend Development

1.  **Step 7: Create Landing/Dashboard Page**

    - Create `/pages/index.tsx` to serve as the landing page with modern UI using Tailwind CSS.
    - Use the color palette (white background, golden-yellow accent, dark gray/black text) and typography (Montserrat, Proxima Nova) (**Design & Branding**).

2.  **Step 8: Create Search Results Page**

    - Create `/pages/search.tsx` that will display search results. The page must support both list and map views and include filters (zip code, city, state, quantity, vendor) (**Project Overview & App Flow**).

3.  **Step 9: Build Search Bar Component**

    - Create `/components/SearchBar.tsx` using Shadcn UI.
    - Add autocomplete functionality and integrate filter inputs. Validation rules should be applied based on project requirements (**Project Overview: Key Features**).

4.  **Step 10: Develop Map View Component**

    - Create `/components/MapView.tsx` to show geolocation-based material locations.
    - Integrate geolocation API to center the map on the user's current location (**Project Overview: Geolocation & App Flow**).

5.  **Step 11: Style the App Using Tailwind CSS**

    - Configure Tailwind’s config file (e.g., `/tailwind.config.js`) to include the golden-yellow accent and other design tokens.
    - Ensure the design is mobile-first and complies with WCAG 2.1 AA (color contrast, readability, keyboard navigation) (**Design & Branding & Accessibility**).

6.  **Validation:**

    - Run the Next.js development server (`npm run dev`) and visually verify the landing page, search results page, search bar, and map view function and adhere to design guidelines.

## Phase 3: Backend Development

1.  **Step 12: Set Up Supabase for Database**

    - Create a new Supabase project and configure the database for storing any optional user accounts, saved searches, and system logs (**Tech Stack: Backend**).
    - Note down the Supabase project URL and API keys for integration.

2.  **Step 13: Integrate Clerk Auth (Optional)**

    - Follow Clerk Auth documentation to set up authentication if user accounts are enabled.
    - Create configuration file `/backend/config/clerk.config.js` for Clerk integration (**Tech Stack: Backend & Optional**).

3.  **Step 14: Create Server Action for Material Search**

    - In `/app/actions/material-search.ts`, implement the endpoint that will call the Firecrawl API for real-time material availability and pricing data (**Project Overview: Key Features**).

4.  **Step 15: Integrate Firecrawl API**

    - Create a helper file `/lib/firecrawl.ts` to handle requests to Firecrawl.
    - Include real-time updates logic as per documentation provided by Firecrawl (**Integrations: Firecrawl**).

5.  **Step 16: Create Server Action for Search Re-Ranking**

    - In `/app/actions/rerank-search.ts`, implement the endpoint that sends search results to Cohere for re-ranking.
    - Create helper file `/lib/cohere.ts` for Cohere API calls (**Project Overview: Key Features & Integrations: Cohere**).

6.  **Step 17: Integrate Pinecone Vector Database**

    - Create helper file `/lib/pinecone.ts` to manage data for material search indexing.
    - Follow Pinecone documentation to integrate vector similarity searches into the endpoint logic (**Integrations: Pinecone**).

7.  **Step 18: Integrate OpenAI for Additional Processing**

    - Create helper file `/lib/openai.ts` that calls OpenAI for any further natural language processing required for search query enhancement (**Tech Stack: Backend**).

8.  **Validation:**

    - Use Postman or curl to test `/api/material-search` and `/api/rerank-search` endpoints ensuring they return expected data.

## Phase 4: Integration

1.  **Step 19: Connect Frontend Search Bar to Material Search API**

    - Update `/components/SearchBar.tsx` to make an API call to `/api/material-search` when a search is submitted using `axios` or `fetch` (**App Flow: Search Functionality**).

2.  **Step 20: Integrate Autocomplete and Filters**

    - Ensure the search bar leverages autocomplete suggestions from the Firecrawl API, and validate filters work as expected (**Project Overview: Key Features & App Flow**).

3.  **Step 21: Connect Search Results to Re-Ranking API**

    - After fetching initial search results, call `/api/rerank-search` to reorder the results using Cohere.
    - Update UI in `/pages/search.tsx` once new order is received (**Project Overview: Search Re-Ranking**).

4.  **Step 22: Integrate Map View with Geo-Location Data**

    - Ensure `/components/MapView.tsx` fetches geolocation data and displays nearby materials from the API responses.
    - Use browser geolocation API to center the map on the user’s location (**Project Overview: Geolocation**).

5.  **Step 23: Integrate Supabase & Optional Clerk Auth on Frontend**

    - If user authentication is enabled, implement auth flows in `/pages/login.tsx` and /or `/components/AuthForm.tsx` using Clerk SDK.
    - Connect authenticated user sessions with stored data in Supabase (e.g., saved searches) (**Integrations: Clerk Auth & Supabase**).

6.  **Validation:**

    - Perform end-to-end testing by running sample searches, verifying that material data loads, results are re-ranked, and the map view displays locations correctly.

## Phase 5: Deployment

1.  **Step 24: Prepare for Deployment**

    - Ensure all environment variables for Supabase, Clerk, Firecrawl, Cohere, Pinecone, and OpenAI are properly set in a `.env` file at the project root (**Integration: Third-Party API Keys**).

2.  **Step 25: Set Up CI/CD Pipeline with GitHub Actions**

    - Create `.github/workflows/ci.yml` to run tests, linting, and build the application on push events to `main` and `dev` (**Tech Stack: Deployment**).

3.  **Step 26: Deploy to Vercel (or Preferred Hosting)**

    - Connect the GitHub repository to Vercel for seamless deployment.
    - Configure Vercel settings to deploy the Next.js app with the necessary environment variables.

4.  **Step 27: Enable Caching and CDN**

    - Configure Vercel’s edge network to cache static assets and use its CDN to ensure low latency for a global audience (**Infrastructure & Performance**).

5.  **Step 28: Implement Secure Supabase Authentication**

    - Configure Supabase client to properly handle authentication with Clerk by using the `getSupabaseClient` function with user ID headers
    - Implement secure Row Level Security (RLS) policies in Supabase that check the `x-user-id` header
    - Add service role policies for admin operations
    - Ensure all database operations (SELECT, INSERT, UPDATE, DELETE) are properly secured
    - Test the authentication flow to verify that users can only access their own data

6.  **Step 29: Test Deployment**

    - After deployment, run a test script using Cypress or manual tests to verify that all pages load, APIs are responsive, and third-party integrations are functioning properly (**Q&A: Pre-Launch Checklist**).

7.  **Validation:**

    - Confirm that the live application meets performance, accessibility, and functional requirements by performing load tests and accessibility checks.

This comprehensive plan sets up the environment, builds a mobile-first, accessible frontend with Next.js 14, integrates robust backend services via Supabase and third-party APIs (Firecrawl, Cohere, Pinecone, and OpenAI), and finally deploys the app with CI/CD and CDN configurations.
