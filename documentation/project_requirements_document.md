# Project Requirements Document (PRD)

## 1. Project Overview

This project is an app designed to help construction workers and related professionals (like procurement specialists, project managers, and supply chain coordinators) quickly find the materials they need for their projects. The app solves the problem of inefficient material sourcing by providing real-time data on material availability and pricing, along with intuitive search and filtering options. With integrations for updating data (using Firecrawl), re-ranking search results (powered by Cohere), and managing vector data (via Pinecone), the app is built to deliver fast, relevant, and up-to-date information that helps users make informed buying decisions on the fly.

The app is being built with the goal of streamlining the acquisition process on construction sites. Its key objectives include providing a mobile-first, user-friendly interface that supports quick data access, ensuring that users can search by location and other filters, and offering map views powered by geolocation to display nearby material suppliers. Success will be measured by the ease of finding materials, reduction in downtime caused by material unavailability, and overall user satisfaction with both the interface and the data accuracy.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   Integration with Firecrawl for daily real-time updates on material availability and pricing.

*   Implementation of a search bar with autocomplete suggestions and intuitive filters (zip code, city, state, quantity, and vendor).

*   Re-ranking of search results using Cohere to improve relevance.

*   Storage and management of vector data using Pinecone.

*   Design of a mobile-first interface including:

    *   Landing Page/Dashboard with key widgets (favorite materials, most purchased items).
    *   Search Results Page with both list and map views, including modal pop-ups for detailed item info.
    *   Detailed Item Page with vendor contact information, product reviews, safety guidelines, and direct links to purchase from existing e-commerce platforms.

*   Geolocation feature for the map view to display nearby suppliers.

*   Accessibility compliance aimed at WCAG 2.1 AA standards.

*   Option for users to create accounts for personalized features (e.g., saved searches, favorites, purchase history) though not required for basic access.

**Out-of-Scope:**

*   Development of a new purchasing system (the app will use direct links to existing e-commerce systems).
*   Advanced user account management for the first version beyond basic personalization.
*   Offline mode or full native mobile app functionalities; the focus is on the web.
*   Extensive branding animations or highly complex UI transitions beyond a modern and clean design.
*   Custom integrations outside of Firecrawl, Cohere, and Pinecone.
*   Any features not directly connected to sourcing and displaying construction materials.

## 3. User Flow

A typical user will land on a clean, modern dashboard that welcomes them with a prominent search bar in the center and key widgets highlighting favorite items and most purchased materials. Without needing to register, a construction worker or procurement specialist begins typing material names or other queries into the search bar, receiving autocomplete suggestions along the way. Filters (such as zip code, city, state, quantity, and vendor) are available to narrow down the search, ensuring that users get the most relevant results.

Once the search is initiated, the app presents a results page where users can view information in both list and map formats. In the list view, details such as price, available quantity, and store location are clearly displayed, while the map view uses geolocation to show nearby material suppliers with icon pin drops and modal pop-ups for additional details. When a user clicks on a specific item, they are directed to an item details page that offers comprehensive information including vendor contact details, product reviews, and essential safety guidelines. If they decide to purchase an item, direct links lead them to an existing e-commerce platform where the transaction process is handled externally.

## 4. Core Features

*   **Real-Time Data Integration**

    *   Daily updates on material availability and pricing via Firecrawl.
    *   Automatic refresh of information to ensure users always have current data.

*   **Advanced Search and Filter Functionality**

    *   A search bar with autocomplete suggestions to speed up the query process.
    *   Filters for zip code, city, state, quantity, and vendor to refine search results.

*   **Search Result Re-ranking**

    *   Integration with Cohere to re-rank and display the most relevant search results.

*   **Vector Database Management**

    *   Use of Pinecone to store, search, and manage vector representations of material data.

*   **User Interface (UI) and Experience (UX) Design**

    *   Mobile-first design with a clean landing page/dashboard.
    *   Two views for search results: list view and map view with interactive pin drops.
    *   Detailed item information page including vendor contact, reviews, and safety guidelines.

*   **Geolocation**

    *   Use of geolocation capabilities to show nearby suppliers in map view.
    *   Privacy and user permissions managed properly.

*   **Optional User Personalization**

    *   Allow users to create an account for saving searches and favorite materials.
    *   Maintain an open-access design (no mandatory registration) for quick usage.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Next.js for the overall app framework with a focus on server-side rendering.
    *   Tailwind CSS for rapidly building custom-designed, responsive layouts.
    *   Shadcn UI components for modern, clean UI elements.
    *   Typescript to ensure code quality and fewer runtime errors.

*   **Backend:**

    *   Supabase to handle data storage, user account management (if opted in), and real-time updates.
    *   Clerk Auth for simplified, optional user authentication.

*   **Third-Party Integrations:**

    *   Firecrawl for real-time data integration.
    *   Cohere for improving the relevance and ranking of search results.
    *   Pinecone to manage vector data storage and queries.
    *   Open AI for any potential conversational interfaces or additional smart features.

*   **Development Tools:**

    *   Windsurf as the modern IDE with integrated AI coding capabilities.
    *   CodeGuide Starter Pro as the initial project repository providing the basic structure and guidelines.

## 6. Non-Functional Requirements

*   **Performance:**

    *   The app must handle high volumes of daily search queries with minimal latency.
    *   Utilize caching and microservices architecture to ensure quick loading times and handling spikes in traffic.
    *   Target response times should be within 2-3 seconds for most operations.

*   **Security:**

    *   Secure integration with all third-party services using secured API keys.
    *   Ensure proper data protections and user privacy, particularly with geolocation and personal data.
    *   Follow standard web security practices to guard against common vulnerabilities.

*   **Accessibility & Usability:**

    *   Design in accordance with WCAG 2.1 AA guidelines.
    *   Ensure high-contrast colors, screen reader compatibility, and keyboard navigability.
    *   Focus on a simple, clean mobile-first interface that supports intuitive navigation.

*   **Scalability:**

    *   Use cloud-based autoscaling to handle increased traffic during peak hours.
    *   Microservices architecture to manage different functionalities independently.
    *   Consider CDN integration for faster content delivery across regions.

## 7. Constraints & Assumptions

*   The app is targeted for web deployment only in the initial launch phase.
*   Real-time data, autocomplete, and search re-ranking are dependent on the proper functioning and availability of Firecrawl, Cohere, and Pinecone APIs. API keys will be obtained through developer accounts.
*   It is assumed that users will primarily access the app via mobile devices on-site; hence, the mobile-first approach.
*   While the app provides an option for user personalization, basic access remains open to ensure quick usability.
*   The direct purchase links will redirect users to existing e-commerce platforms, meaning that responsibility for transaction processing lies outside of this app.
*   The development environment leverages Next.js, Tailwind CSS, Supabase, and similar tools as provided by the CodeGuide Starter Pro kit.

## 8. Known Issues & Potential Pitfalls

*   **Third-Party API Reliability:**

    *   Dependence on Firecrawl, Cohere, and Pinecone might become a bottleneck if any service experiences downtime or changes in API specifications. Regularly monitor API statuses and have fallback mechanisms where possible.

*   **Scalability Challenges:**

    *   High volumes of queries and real-time updates might affect performance. Consider implementing efficient caching and possibly a microservices architecture to mitigate slowdowns.

*   **Geolocation and Privacy:**

    *   Integrating geolocation services always comes with privacy concerns. Ensure that user permissions are explicit and that data handling complies with privacy standards.

*   **User Experience on Diverse Devices:**

    *   A mobile-first design must cater to a wide range of screen sizes. Rigorous testing across devices is required to ensure consistent functionality and responsiveness.

*   **Integration Complexity:**

    *   Combining real-time data, vector search, and interactive maps could introduce integration complexities. Adopt a modular development approach so that each component can be individually tested and updated.

*   **Accessibility:**

    *   Ensuring strict adherence to accessibility standards might require additional effort, especially with dynamic content and interactive elements. Continuous testing with screen readers and keyboard navigation is advised.

With these details, the AI has a complete, structured understanding of the Construction Material Finder App. All specifications, design guidelines, technical stack details, and integration points are clear, ensuring that further technical documentation can be generated without ambiguity.
