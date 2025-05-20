# .windsurfrules

## Project Overview

*   **Type:** windsurf_file
*   **Description:** An app that helps construction workers find materials they need for their projects. It features real-time data updates (via Firecrawl), advanced search with autocomplete and filters, result re-ranking using Cohere, and vector data management with Pinecone. The design is mobile-first with a clean landing page/dashboard, a detailed search results page (with both list and map views), and comprehensive item detail pages containing vendor info, reviews, and direct e-commerce links.
*   **Primary Goal:** Help construction workers and related professionals quickly and efficiently source construction materials through a real-time, mobile-first, and user-friendly interface.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14 (App Router): Uses the `app/` directory with nested route folders following the `app/[route]/page.tsx` conventions.
    *   Example: `app/auth/login/page.tsx` for authentication flows using server actions.

### Core Directories

*   **Versioned Structure:**

    *   app/api: Next.js 14 API routes with Route Handlers (e.g., webhooks, integration endpoints).
    *   components: Contains UI components, including shadcn UI elements and providers, following Next.js 14 best practices.

### Key Files

*   **Stack-Versioned Patterns:**

    *   app/layout.tsx: Implements the root layout for the Next.js 14 App Router.
    *   app/page.tsx: Entry point for the landing/dashboard page, following Next.js 14 conventions.

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14: Must use the App Router architecture. No usage of the Pages Router (i.e., no `pages/` directory) is allowed.

## PRD Compliance

*   **Non-Negotiable:**

    *   "The app is designed to help construction workers and related professionals quickly find the materials they need for their projects." This requirement enforces a mobile-first, real-time, and intuitive search experience with comprehensive item details.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Next.js 14 Auth Flow → `app/auth/login/page.tsx` uses server actions for optional user personalization, maintaining high accessibility standards (WCAG 2.1 AA).
