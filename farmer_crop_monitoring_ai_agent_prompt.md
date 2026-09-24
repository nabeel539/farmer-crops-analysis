# Farmer & Crop Monitoring System
## Frontend End-to-End Build Prompt for an AI Coding Agent

## 1. Project Objective

Build a complete frontend-only application called **Farmer & Crop Monitoring System**.

This is an internal AgriTech platform for monitoring the complete journey of wheat farming:

**Seed Distribution → Land → Crop Cycle → Farming Activities → Inputs → Irrigation → Crop Growth → Weather → Notifications → Harvest → Production → Analytics**

The current phase is **100% frontend/UI**.

There is NO real backend, database, authentication server, AI/ML service, or external API integration required in this phase.

Use realistic, well-structured **dummy/mock data** throughout the application.

The UI must look production-ready because it will be demonstrated to the Team Lead / CEO as the proposed product.

---

# 2. IMPORTANT: Theme Is Already Finalized

The project already uses the finalized Tweakcn theme.

Install/use the existing theme with:

```bash
npx shadcn@latest add https://tweakcn.com/r/themes/cmlf6yp47000104ld4ijt51m7
```

**Do not replace, redesign, or introduce another theme.**

Use the installed Tweakcn/shadcn theme as the single visual source of truth.

Do not randomly introduce new colors.

Maintain the existing theme consistently across:

- Admin dashboard
- Field Officer dashboard
- Farmer application
- Tables
- Forms
- Charts
- Maps
- Dialogs
- Drawers
- Notifications
- Empty states
- Loading states
- Error states

The product is agriculture-focused, but it should look like a **modern professional AgriTech SaaS product**, not a gardening website.

Agriculture should be communicated through:

- Field maps
- Crop lifecycle
- Wheat-related data
- Weather
- Irrigation
- Crop stages
- Farming activity icons
- Production analytics
- Field status
- Photos

Do NOT add excessive farming illustrations, emojis, cartoon graphics, or decorative agricultural elements.

---

# 3. Core Product Concept

The application manages farmers and their farms.

The basic domain relationship is:

```text
Farmer
   ↓
Farm
   ↓
Field
   ↓
Crop Cycle
   ↓
Activities / Inputs / Observations
   ↓
Harvest
   ↓
Production
   ↓
Analytics
```

Example:

```text
Farmer: Ramesh Kumar

Field A
  Area: 2.4 Acres
  Crop: Wheat
  Seed: 100 KG
  Stage: Tillering

  Activities:
    - Sowing
    - Irrigation
    - Urea
    - DAP
    - Crop Observation

  Expected Production: 1,250 KG
  Actual Production: 1,180 KG
```

---

# 4. User Roles

Implement frontend role-based navigation and UI behavior using mock users.

Roles:

```text
SUPER_ADMIN
AGRI_MANAGER
FIELD_OFFICER
FARMER
```

## Super Admin

Can see everything:

- Dashboard
- Farmers
- Fields
- Crop Cycles
- Seed Management
- Activities
- Crop Monitoring
- Harvest
- Analytics
- Reports
- Weather
- Calendar
- Notifications
- Users & Roles
- Settings

## Agriculture Manager

Can manage:

- Farmers
- Fields
- Crop Cycles
- Seed Distribution
- Farming Activities
- Crop Monitoring
- Harvest
- Analytics
- Reports

## Field Officer

Focus on field operations:

- Assigned farmers
- Assigned fields
- Field visits
- Crop observations
- Photos
- Activity verification
- Crop health
- Field status

## Farmer

Only sees the Farmer App:

- Home
- My Fields
- Crop Cycle
- Activities
- Weather
- Calendar
- Notifications
- Profile

The role system is currently frontend-only. Do not build real JWT/authentication.

---

# 5. Application Structure

Build one frontend application with separate experiences:

```text
/admin/*
/field-officer/*
/farmer/*
```

Use a shared component system.

Recommended conceptual structure:

```text
src/
  app/
  components/
    ui/
    layout/
    charts/
    maps/
    tables/
    forms/
    farmer/
    admin/
    field-officer/
  data/
    farmers.ts
    fields.ts
    cropCycles.ts
    seedDistributions.ts
    activities.ts
    inputs.ts
    irrigation.ts
    observations.ts
    harvests.ts
    expenses.ts
    weather.ts
    notifications.ts
    calendar.ts
    analytics.ts
  lib/
  types/
```

Adapt this structure to the existing project conventions.

Keep dummy data separate from components so it can later be replaced with API calls.

---

# 6. Main Admin Navigation

Create a professional desktop sidebar:

```text
Dashboard

Farmers
Fields
Crop Cycles

Seed Management
  - Seed Inventory
  - Distribution

Farm Activities
  - All Activities
  - Fertilizers
  - Irrigation
  - Pesticides
  - Other Inputs

Crop Monitoring
  - Crop Growth
  - Observations
  - Photos

Harvest
Production

Calendar
Weather
Analytics
Reports
Notifications

Users & Roles
Settings
```

Use Lucide icons.

Do not use emojis for primary navigation icons.

---

# 7. Admin Dashboard

Create a polished operations dashboard.

Header:

```text
Good morning, Admin

Here's what's happening across your farms.
```

KPI cards:

```text
Total Farmers
42

Total Fields
67

Total Cultivated Land
126.4 Acres

Seed Distributed
2,150 KG

Remaining Seed
350 KG

Expected Production
68,000 KG

Actual Production
64,800 KG
```

Additional dashboard sections:

### Crop Health

```text
Healthy
48 Fields

Attention Required
12 Fields

Problem
7 Fields
```

### Production Chart

Show:

- Expected production
- Actual production
- Production trend

### Field Health Map

Show dummy field polygons.

### Recent Activities

Example:

```text
Ramesh Kumar
Added 25 KG Urea
Field A
Today, 09:30 AM

Suresh Singh
Completed Irrigation
Field B
Today, 08:10 AM
```

### Upcoming Events

```text
Field inspection
Tomorrow

Fertilizer application
25 Dec

Harvest expected
15 Jan
```

---

# 8. Farmer Management

Create a farmer listing page.

Columns:

```text
Farmer
Farmer ID
Village
Fields
Land Area
Seed Received
Crop
Crop Stage
Status
Actions
```

Example:

```text
Ramesh Kumar
FR-001
Village A
2 fields
4.2 Acres
180 KG
Wheat
Tillering
Healthy
```

Features:

- Search
- Filter
- Sort
- Pagination UI
- Add Farmer
- View Farmer
- Edit Farmer
- Status filter

Use realistic dummy data.

---

# 9. Farmer Profile

Create a detailed farmer profile page.

Header:

```text
Ramesh Kumar
Farmer ID: FR-001

Village A
Rajasthan

Status: Active
```

Summary:

```text
Land
4.2 Acres

Fields
2

Seed Received
180 KG

Expected Production
2,200 KG

Actual Production
2,050 KG
```

Tabs:

```text
Overview
Fields
Crop Cycle
Activities
Inputs
Irrigation
Growth
Harvest
Expenses
Timeline
```

Create meaningful content for every tab.

---

# 10. Field Management

Create a field management page.

Each field should have:

```text
Field ID
Field Name
Farmer
Area
Boundary
Crop
Crop Variety
Sowing Date
Crop Stage
Health Status
Irrigation Source
Soil Type
```

Example:

```text
Field A
2.4 Acres
Ramesh Kumar
Wheat
Tillering
Healthy
Tube Well
Loamy Soil
```

---

# 11. Land Mapping / Polygon Feature

This is one of the most important product features.

Users should be able to:

- View field boundaries
- Draw a field boundary
- Edit a boundary
- Delete a boundary
- View calculated area
- Assign field to farmer
- Assign crop to field

For this frontend prototype, map interaction can use dummy coordinates or a map library.

If a map library is already installed, use it.

Otherwise create a clean map placeholder component with realistic polygons and a clear path for later map integration.

Do NOT fake actual GPS data as if it were real.

### Field colors

Use semantic status:

```text
Healthy
Attention Required
Problem
```

Polygon fill should be subtle/translucent.

Clicking a polygon should open a field detail panel:

```text
Field A

Farmer:
Ramesh Kumar

Area:
2.4 Acres

Crop:
Wheat

Stage:
Tillering

Seed:
100 KG

Expected Production:
1,250 KG

Status:
Healthy
```

---

# 12. Crop Cycle

Create a complete crop cycle page.

Example:

```text
Wheat 2026-27

Variety:
HD-2967

Sowing Date:
15 Nov 2026

Expected Harvest:
15 Jan 2027

Seed Quantity:
100 KG

Expected Production:
1,250 KG

Current Stage:
Tillering
```

---

# 13. Crop Lifecycle Timeline

Create a visual timeline:

```text
Seed Distribution
      ↓
Land Preparation
      ↓
Sowing
      ↓
Germination
      ↓
Crown Root Initiation
      ↓
Tillering
      ↓
Stem Extension
      ↓
Booting
      ↓
Flowering
      ↓
Grain Filling
      ↓
Maturity
      ↓
Harvest
```

Each completed stage should display:

- Date
- Field
- Notes
- Photos where available

---

# 14. Seed Management

CEO provides approximately:

```text
25 Quintals
= 2,500 KG
```

Create Seed Inventory.

Dashboard:

```text
Total Received
2,500 KG

Distributed
2,150 KG

Remaining
350 KG
```

Create distribution history:

```text
Farmer
Quantity
Date
Batch
Field
Status
```

Create a "Distribute Seed" form:

```text
Farmer
Field
Crop
Seed Quantity
Distribution Date
Batch Number
Remarks
```

Add a visual seed inventory progress indicator.

---

# 15. Farm Activities

Create a unified activity system.

Activity types:

```text
Fertilizer
Irrigation
Pesticide
Herbicide
Weed Management
Land Preparation
Sowing
Field Inspection
Crop Observation
Other
```

Activity list:

```text
Date
Farmer
Field
Activity
Quantity
Unit
Cost
Status
Submitted By
Verified By
```

Activity detail should show a timeline/audit style layout.

---

# 16. Fertilizer Tracking

Support:

```text
Urea
DAP
MOP
NPK
Other
```

Fertilizer record:

```text
Field
Fertilizer
Quantity
Unit
Date
Cost
Application Method
Remarks
Photo
```

Example:

```text
Urea
25 KG
₹700
20 Dec 2026
Broadcasting
```

---

# 17. Irrigation Tracking

Record:

```text
Field
Date
Duration
Water Source
Estimated Water Quantity
Method
Remarks
```

Example:

```text
Field A
20 Dec 2026
2 Hours
Tube Well
```

Show irrigation history and frequency.

---

# 18. Pesticide / Crop Protection

Create:

```text
Pesticide
Herbicide
Fungicide
Other
```

Record:

```text
Product
Quantity
Unit
Date
Field
Reason
Application Method
Cost
Remarks
```

Also provide a crop issue reporting form:

```text
Issue Type:
Pest / Disease / Weed / Other

Severity:
Low / Medium / High

Description
Photo
```

---

# 19. Crop Monitoring

Create a crop monitoring dashboard.

Metrics:

```text
Current Crop Stage
Plant Height
Crop Condition
Last Observation
Days Since Sowing
Last Irrigation
Last Fertilizer
```

Observation form:

```text
Field
Date
Crop Stage
Plant Height
Crop Condition
Pest/Disease Present
Severity
Remarks
Photo
```

---

# 20. Crop Photos

Create a visual crop photo timeline.

Example:

```text
15 Nov
Sowing

20 Nov
Germination

05 Dec
Tillering

15 Dec
Tillering

25 Dec
Crop Growth
```

Photos should appear in cards/gallery format.

Use dummy images or placeholders if no image assets are available.

Do not create fake claims based on images.

---

# 21. Weather

Create a Weather page and farmer weather widget.

Display:

```text
Current Temperature
Humidity
Wind
Rain Probability
Rainfall
Forecast
Weather Alerts
```

Example:

```text
28°C
64% Humidity
12 km/h Wind
20% Rain Probability
```

7-day forecast UI.

Weather should currently use dummy data.

Do not integrate a real weather API in this frontend-only phase.

Design the component so a real weather API can replace the mock data later.

---

# 22. Calendar

Create a full farming calendar.

Events:

```text
Irrigation
Fertilizer
Pesticide
Field Inspection
Crop Observation
Sowing
Harvest
Other
```

Calendar views:

- Month
- Week
- Day

Click event to open detail drawer/modal.

Example:

```text
Fertilizer Application

Field:
Field A

Input:
Urea

Expected Quantity:
25 KG

Date:
25 Dec 2026

Status:
Upcoming
```

---

# 23. Notifications

Create a notification center.

Notification types:

```text
Weather Alert
Irrigation Reminder
Fertilizer Reminder
Crop Monitoring Reminder
Field Visit
Harvest Reminder
Activity Verification
System Notification
```

Include:

- Read/unread state
- Timestamp
- Notification type
- Related field
- Action

---

# 24. Notification Settings

Create settings for:

```text
Irrigation Reminders
Fertilizer Reminders
Weather Alerts
Field Visit Alerts
Crop Monitoring
Harvest Reminders
```

Channels:

```text
In-App
SMS
WhatsApp
Email
```

For now, settings are UI-only.

---

# 25. Harvest

Create Harvest Management.

Fields:

```text
Farmer
Field
Crop
Harvest Date
Production Quantity
Moisture
Quality Grade
Storage Location
Selling Price
Revenue
```

Example:

```text
Expected Production:
1,250 KG

Actual Production:
1,180 KG

Variance:
-70 KG
```

---

# 26. Production Analytics

Create a professional analytics dashboard.

Charts:

### Expected vs Actual Production

Compare farmers/fields.

### Yield Per Acre

```text
Farmer A: 600 KG/Acre
Farmer B: 560 KG/Acre
Farmer C: 645 KG/Acre
```

### Seed vs Production

Show relationship visually.

### Fertilizer Usage

```text
Urea
420 KG

DAP
310 KG

NPK
180 KG
```

### Irrigation Frequency

Compare fields.

### Farming Cost

```text
Seed
Fertilizer
Pesticide
Irrigation
Labor
Other
```

### Cost per KG

```text
Total Cost / Actual Production
```

Do not create arbitrary rankings such as "Best Farmer".

Show objective metrics and comparisons.

---

# 27. Reports

Create a Reports page.

Report cards:

```text
Farmer Performance Report
Crop Production Report
Seed Distribution Report
Input Usage Report
Expense Report
Harvest Report
Field Activity Report
```

Buttons:

```text
View
Download
```

For this phase, download can be a mock UI action or simple frontend-generated export if easy.

Do not build a backend reporting system.

---

# 28. Field Officer Experience

Create a lighter field officer dashboard.

Dashboard:

```text
Assigned Farmers
Assigned Fields
Pending Verifications
Today's Visits
Open Issues
```

Field officer should be able to:

- View assigned farmers
- View field
- View crop status
- Add observation
- Upload photo
- Verify farmer activity
- Reject activity
- Add field visit
- Add notes

Verification states:

```text
PENDING
VERIFIED
REJECTED
```

---

# 29. Farmer Mobile Experience

The Farmer App must be mobile-first.

Use a bottom navigation:

```text
Home
Fields
Activities
Calendar
Profile
```

Home should show:

```text
Good morning, Ramesh

Wheat
Tillering Stage

4.2 Acres
180 KG Seed

Weather
28°C
20% Rain

Upcoming Activity
Irrigation tomorrow

Quick Actions
Fertilizer
Irrigation
Pesticide
Observation
Photo
```

The Farmer App must be extremely simple.

Avoid large admin-style tables on mobile.

Use:

- Cards
- Bottom sheets
- Drawers
- Simple forms
- Large touch targets
- Short labels

---

# 30. Farmer Field Screen

Show:

```text
My Fields

Field A
2.4 Acres
Wheat
Tillering
Healthy

Field B
1.8 Acres
Wheat
Germination
Attention Required
```

Field detail:

```text
Field Map
Area
Crop
Crop Stage
Seed
Last Irrigation
Last Fertilizer
Health
Upcoming Activity
```

---

# 31. Farmer Add Activity Flow

Use a simple quick-action flow.

First:

```text
What did you do today?

Fertilizer
Irrigation
Pesticide
Observation
Photo
```

Then open the corresponding form.

Do NOT make one giant "Add Activity" form.

---

# 32. Farmer Profile

Show:

```text
Farmer Name
Farmer ID
Village
District
Assigned Officer
Phone

Farm Summary
Fields
Land Area
Crop
Seed Received
Expected Production
```

---

# 33. Responsive Design

The application must work across:

```text
Desktop
Laptop
Tablet
Mobile
```

Admin:

Desktop-first but responsive.

Farmer:

Mobile-first.

The Farmer UI will later be wrapped with **Capacitor** to create the mobile application.

Do not create a separate React Native application at this stage.

The Farmer experience should already feel like a mobile app inside the responsive web application.

---

# 34. Capacitor Preparation

Do not actually require native Android functionality yet.

However:

- Avoid browser-only assumptions where possible.
- Keep farmer routes/components mobile-friendly.
- Keep camera/photo upload UI compatible with future Capacitor integration.
- Keep geolocation/map functionality isolated behind reusable components.
- Do not hardcode desktop-only interactions.

Future direction:

```text
Next.js / React Farmer UI
        ↓
Capacitor
        ↓
Android App
```

---

# 35. Components To Build

Create reusable components for:

```text
DashboardCard
StatCard
StatusBadge
PageHeader
SearchBar
FilterBar
DataTable
EmptyState
LoadingState
ErrorState
ConfirmDialog
FormDrawer
DetailDrawer
Timeline
ActivityCard
FieldCard
CropStageBadge
WeatherCard
NotificationItem
CalendarEvent
MapContainer
FieldPolygon
CropPhotoGallery
MetricCard
ChartCard
```

Do not duplicate these components across pages.

---

# 36. Forms

Use React Hook Form + Zod where appropriate.

Create reusable form patterns.

All forms should have:

- Labels
- Required indicators where relevant
- Validation
- Error messages
- Loading state
- Success state
- Cancel action
- Submit action

Since there is no backend:

After submission, update local mock state where practical and show a success notification/toast.

---

# 37. Tables

Desktop tables should support:

- Search
- Filters
- Sort
- Pagination UI
- Row actions
- Status badges

On mobile, do not force wide tables.

Convert important rows into responsive cards.

---

# 38. Dummy Data Requirements

Use realistic Indian agriculture-related dummy data.

Examples:

Farmers:

```text
Ramesh Kumar
Suresh Singh
Mahendra Sharma
Abdul Rahman
Rajesh Meena
```

Locations can use generic/dummy villages and districts.

Do not use real personal information.

Use realistic:

- Acres
- KG
- Dates
- Fertilizer quantities
- Production
- Costs
- Weather values

Use the initial seed inventory:

```text
2,500 KG
```

Create enough data to make charts and tables look realistic.

At least:

```text
10-15 Farmers
15-25 Fields
Multiple Crop Cycles
30+ Activities
Multiple Harvest Records
Multiple Notifications
```

---

# 39. Data Relationships

Keep dummy data relational.

Example:

```text
farmerId
fieldId
cropCycleId
activityId
```

Do not duplicate unrelated farmer/field objects everywhere.

Example:

```ts
{
  id: "field-001",
  farmerId: "farmer-001",
  name: "Field A",
  area: 2.4,
  cropCycleId: "crop-001"
}
```

This will make the future API migration much easier.

---

# 40. State Management

For this frontend prototype, do not introduce unnecessary complex state management.

Use local component state and a lightweight shared state approach where needed.

Mock data should behave realistically.

For example:

- Adding an activity should update the activity list.
- Changing notification read state should update the UI.
- Updating farmer status should update the relevant UI.
- Seed distribution should update the displayed inventory numbers if practical.

No backend persistence is required.

---

# 41. Toasts and Feedback

Use consistent toast notifications.

Examples:

```text
Farmer added successfully.

Seed distribution recorded.

Fertilizer activity submitted.

Field observation saved.

Notification marked as read.

Field updated successfully.
```

---

# 42. Empty / Loading / Error States

Every major page should have sensible states.

Examples:

```text
No farmers found.

No activities recorded for this field.

No notifications.

No crop observations yet.

No harvest data available.
```

Do not leave blank screens.

---

# 43. Accessibility

Follow basic accessibility practices:

- Semantic HTML
- Proper labels
- Keyboard navigation
- Visible focus states
- Good contrast
- Accessible buttons
- Accessible form errors
- Do not rely only on color for status

For example, field status should show both:

```text
🟢 Healthy
```

and text, not color alone.

---

# 44. Design Quality Rules

The final UI should feel like a real product.

Avoid:

- Generic AI-generated dashboard look
- Too many gradients
- Excessive rounded cards
- Excessive shadows
- Random colors
- Random icon styles
- Huge headings
- Excessive whitespace that hides useful data
- Overly dense tables
- Emoji-heavy navigation
- Placeholder text such as "Lorem ipsum"
- Fake statistics without context

Prefer:

- Consistent spacing
- Consistent component sizes
- Strong hierarchy
- Clear data relationships
- Meaningful empty states
- Professional charts
- Clear agricultural context
- Clean responsive layouts

---

# 45. Future Backend Compatibility

The frontend should be designed so the future backend can replace mock data.

Future architecture will likely be:

```text
Frontend
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
S3 / Object Storage
```

Future integrations:

```text
Weather API
Maps API
Notifications
AI / ML
Analytics
```

Do not implement these now.

Instead, isolate data access so future API integration is straightforward.

For example:

```text
data/
services/
types/
```

Keep API-like functions separate from UI components if practical.

---

# 46. Future AI / Data Analytics Direction

Do not implement AI now.

However, the UI should leave room for future features:

### Yield Prediction

```text
Expected Yield
AI Predicted Yield
Actual Yield
```

### Crop Health Analysis

```text
Crop Photo
↓
AI Analysis
↓
Possible Issue
```

### Agriculture Assistant

Future:

```text
Farmer
↓
AI Agriculture Assistant
↓
Weather + Crop + Field + Historical Data
```

### Python Analytics

Future analytics can include:

- Yield prediction
- Production forecasting
- Input vs yield analysis
- Anomaly detection
- Farmer/field performance analysis
- Weather impact analysis

The current frontend should make these additions possible without redesigning the entire application.

---

# 47. Important Product Principle

The application should not simply be:

```text
Farmers CRUD
Fields CRUD
Activities CRUD
```

It should communicate the **complete farming lifecycle**:

```text
Seed
 ↓
Land
 ↓
Crop
 ↓
Activity
 ↓
Input
 ↓
Growth
 ↓
Weather
 ↓
Harvest
 ↓
Production
 ↓
Cost
 ↓
Analytics
```

This lifecycle should be visible throughout the UI.

---

# 48. Demo Flow

The finished frontend must support this demo story:

### Step 1

Open Admin Dashboard.

Show:

```text
42 Farmers
67 Fields
2,500 KG Seed
68,000 KG Expected Production
```

### Step 2

Open Seed Management.

Show:

```text
2,500 KG received
2,150 KG distributed
350 KG remaining
```

### Step 3

Open Farmer:

```text
Ramesh Kumar
```

### Step 4

Open his Field.

Show:

```text
Field A
2.4 Acres
```

and the polygon on the map.

### Step 5

Open Crop Cycle.

Show:

```text
Wheat
Tillering
```

### Step 6

Open Timeline.

Show:

```text
Sowing
Irrigation
Fertilizer
Crop Observation
```

### Step 7

Switch to Farmer App.

Show:

```text
Weather
Upcoming Activity
Add Fertilizer
Add Irrigation
Upload Crop Photo
```

### Step 8

Submit a dummy fertilizer activity.

Show success toast and updated activity.

### Step 9

Return to Admin.

Show the new activity in the farmer/field activity timeline.

### Step 10

Open Analytics.

Show:

```text
Expected vs Actual Production
Yield/Acre
Input Usage
Cost
```

This should make the product story immediately understandable to the Team Lead/CEO.

---

# 49. Development Approach

Build in this order.

## Phase 1: Foundation

- Install/use finalized Tweakcn theme
- Configure global styling
- Set up layout
- Set up routing
- Create reusable UI components
- Create mock data
- Create shared types

## Phase 2: Admin Shell

- Sidebar
- Header
- Breadcrumbs
- User menu
- Notifications
- Responsive behavior

## Phase 3: Admin Core

- Dashboard
- Farmers
- Farmer Profile
- Fields
- Field detail
- Seed Management

## Phase 4: Crop Operations

- Crop Cycle
- Activities
- Fertilizer
- Irrigation
- Pesticides
- Crop Monitoring
- Photos
- Harvest

## Phase 5: Intelligence / Operations

- Weather
- Calendar
- Notifications
- Reports
- Analytics

## Phase 6: Field Officer

- Dashboard
- Assigned Farmers
- Assigned Fields
- Verification
- Field Visits
- Observations

## Phase 7: Farmer App

- Farmer Dashboard
- Fields
- Field Detail
- Add Activity
- Weather
- Calendar
- Notifications
- Profile

## Phase 8: Polish

- Responsive QA
- Empty states
- Loading states
- Error states
- Toasts
- Accessibility
- Consistency
- Demo flow
- Final visual polish

---

# 50. Final Instruction to the AI Coding Agent

Do not build everything blindly in one pass.

Work module-by-module.

Before moving to the next module:

1. Reuse existing components.
2. Reuse the finalized Tweakcn theme.
3. Check responsive behavior.
4. Check visual consistency.
5. Check that dummy data relationships remain correct.
6. Do not introduce a new design language.
7. Do not remove existing working functionality.
8. Keep components maintainable.
9. Prefer reusable components over duplicated code.
10. Keep the UI production-quality.

The final result should feel like a **real AgriTech Farm Operations Platform** that a company could evolve into a production system.

The current goal is a **complete frontend prototype with realistic interactions and dummy data**, ready to demonstrate to the Team Lead and CEO.
