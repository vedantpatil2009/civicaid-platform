# CityPulse Hub

You are an expert Senior Product Designer, Senior Frontend Engineer, React Architect, UI/UX Designer, and Supabase Engineer.

Your task is to build a production-ready SaaS web application called "Smart City Data Platform".

IMPORTANT:
This is NOT a prototype.
This should be built like a real startup product ready for deployment.

====================================================
PROJECT OVERVIEW
====================================================

Build a modern Smart City Platform that enables citizens and city authorities to monitor, report, and manage civic issues.

The platform should have two main portals:

1. Citizen Portal
2. Admin Dashboard

The UI should be inspired by modern Smart City dashboards and municipal portals with a premium SaaS feel. Use the provided design documentation as inspiration only. Do not copy layouts or assets exactly—create an original interface with a similar level of polish.

====================================================
TECH STACK
====================================================

Frontend
- ReactJS
- JavaScript
- React Router
- Vite

Backend
- Supabase

Database
- PostgreSQL

Authentication
- Supabase Auth

Realtime
- Supabase Realtime

Storage
- Supabase Storage

Charts
- Chart.js

Maps
- React Leaflet with OpenStreetMap

Icons
- Lucide React

Deployment
- Vercel

Version Control
- GitHub

====================================================
DESIGN SYSTEM
====================================================

Theme

Modern

Government Portal

Minimal

Professional

Premium SaaS

Rounded Corners

Soft Shadows

Glassmorphism where appropriate

Primary Color

#2347C6

Secondary

#1B2D73

Background

#F6F8FC

Cards

#FFFFFF

Text

#1E293B

Border

#E2E8F0

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Typography

Inter

Spacing

8px design system

Border Radius

16px

Animations

Fade

Slide

Hover Elevation

Micro Interactions

Loading Skeletons

====================================================
RESPONSIVE DESIGN
====================================================

Desktop

Laptop

Tablet

Mobile

Everything must be responsive.

====================================================
APPLICATION MODULES
====================================================

Citizen Portal

Home

Services

Ward Information

Complaint Reporting

Complaint Tracking

Live City Map

Traffic

Pollution

Weather

Water Logging

Emergency Alerts

Notifications

Profile

Admin Portal

Dashboard

Analytics

Complaint Management

Departments

Users

Reports

Settings

====================================================
HOME PAGE
====================================================

Top Navigation

Logo

Services

Ward Info

Dashboard

About

Contact

Login

Primary CTA

Hero Section

Large city banner

Ward search

Quick services

Search by:

Ward Number

Property ID

Citizen ID

Quick Services

Report Complaint

Water Supply

Garbage Collection

Property Tax

Emergency Contacts

Flood Alerts

Traffic Updates

Weather

Dashboard Cards

Active Complaints

AQI

Traffic

Water Logging

Weather

Resolved Issues

Latest Alerts

====================================================
LIVE MAP
====================================================

React Leaflet

OpenStreetMap

Layers

Traffic

Complaints

Flood

AQI

Hospitals

Police

Fire Stations

Colored Markers

Green

Resolved

Yellow

Pending

Orange

High

Red

Critical

====================================================
COMPLAINT SYSTEM
====================================================

Users can

Upload Image

Detect Location

Select Category

Write Description

Submit Complaint

Track Status

Complaint Status

Pending

Assigned

In Progress

Resolved

Rejected

====================================================
ADMIN DASHBOARD
====================================================

Statistics Cards

Complaint Heatmap

Department Performance

Traffic Chart

Pollution Chart

Flood Monitoring

Recent Complaints

Realtime Notifications

====================================================
DATABASE TABLES
====================================================

users

complaints

departments

notifications

ward_information

weather

traffic

pollution

====================================================
SUPABASE
====================================================

Implement

Authentication

Database

Realtime

Storage

Row Level Security

Protected Routes

====================================================
APPLICATION STRUCTURE
====================================================

Create a scalable folder structure.

Separate

Pages

Components

Layouts

Hooks

Contexts

Services

Utilities

Algorithms

====================================================
ALGORITHMS
====================================================

Implement JavaScript utilities for

Complaint Priority

Duplicate Complaint Detection

Complaint Hotspot Detection

Traffic Density Score

Pollution Risk Index

Flood Risk Indicator

====================================================
COMPONENTS
====================================================

Navbar

Sidebar

Hero

Ward Search Card

Service Cards

Dashboard Cards

Map

Complaint Card

Weather Card

AQI Card

Traffic Card

Charts

Footer

Modal

Buttons

Forms

Tables

Pagination

====================================================
USER EXPERIENCE
====================================================

Professional

Fast

Clean

Government Grade

Modern

Minimal

Accessible

Responsive

====================================================
CODE QUALITY
====================================================

Use reusable components.

Use React hooks.

Keep code modular.

No duplicate code.

Follow best practices.

Organize folders professionally.

Write clean code.

====================================================
OUTPUT
====================================================

Generate the complete project structure.

Generate all pages.

Generate reusable components.

Generate routing.

Generate Supabase integration.

Generate sample data.

Generate modern UI.

Generate responsive layouts.

Generate deployment-ready code.

Generate production-quality architecture.

Avoid placeholders where possible and create a polished, cohesive MVP.

Additional Prompt (after the first generation)

Once Lovable generates the project, paste this as a follow-up prompt:

Refine the application into production quality.

Improve spacing and visual hierarchy.

Increase white space.

Improve typography.

Add smooth animations.

Add loading skeletons.

Improve accessibility.

Make every component reusable.

Replace any generic dashboard with a premium SaaS dashboard.

Ensure all pages have consistent spacing, shadows, border radius, colors, and responsive layouts.

Add empty states, error states, loading states, and success states.

Implement Supabase authentication flows, protected routes, and CRUD operations for complaints.

Optimize performance using lazy loading and code splitting.

Prepare the project for deployment on Vercel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://civicaid-platform.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76d42612-9819-4e25-929c-3c10a49849e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
