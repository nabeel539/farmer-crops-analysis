# Krishi AgriTech

## Master AI Coding Agent Prompt

You are the primary AI coding agent responsible for implementing the **Krishi AgriTech Farmer & Crop Management System**.

Your job is to build this system incrementally as a production-quality application.

The project already has an existing Frontend implemented with dummy/mock data.

Your implementation must happen in three major phases:

1. **Phase 1:** Complete the Backend MVP
2. **Phase 2:** Integrate the real Backend APIs with the existing Frontend
3. **Phase 3:** Implement the remaining features and complete the end-to-end system

---

# 1. SOURCE OF TRUTH

The following files are provided in the repository/project:

* `Krishi_AgriTech_Complete_MVP_Workflow.md`
* `BEST_PRACTICES.md`
* Existing Frontend code
* Existing project configuration
* Existing package/dependency files

Treat these as the primary project context.

The `Krishi_AgriTech_Complete_MVP_Workflow.md` defines the product requirements, business workflow, roles, modules, MVP priorities, relationships, and exclusions.

The `BEST_PRACTICES.md` contains engineering, security, architecture, coding, and development rules.

## Important

Before writing implementation code:

1. Inspect the repository.
2. Inspect the existing Frontend.
3. Read the complete MVP workflow.
4. Read `BEST_PRACTICES.md`.
5. Understand the existing project structure.
6. Identify existing reusable components/utilities.
7. Identify dummy-data flows in the Frontend.
8. Identify existing backend code, if any.
9. Do not blindly overwrite existing code.

Do not assume the repository structure.

First understand the existing system, then implement.

---

# 2. PRODUCT OBJECTIVE

Krishi AgriTech manages the agricultural lifecycle:

Vendor
→ Seed Supply
→ Seed Batch
→ Seed Inventory
→ Farmer
→ Multiple Fields
→ Field Polygon
→ Seed Allocation
→ Crop Cycle
→ Crop Plan
→ Farmer Activities
→ Fertilizer / Irrigation / Pesticide Tracking
→ Crop Photos
→ Field Verification
→ Pest/Disease Reporting
→ Harvest
→ Production
→ Yield
→ Season Closure
→ Reports

The most important system requirement is complete traceability:

Vendor
→ Seed Batch
→ Farmer
→ Field
→ Crop Cycle
→ Crop Plan
→ Actual Activities
→ Photos
→ Verification
→ Harvest
→ Production

Do not break this traceability.

---

# 3. CORE TECHNOLOGY STACK

## Backend

Use:

* Python
* FastAPI
* SQLAlchemy 2.x
* Alembic
* PostgreSQL
* Pydantic v2
* JWT authentication
* Secure password hashing
* pytest
* httpx for API testing

Use asynchronous implementation only where it provides a real benefit.

Do not introduce unnecessary technologies.

---

# 4. DATABASE

Use PostgreSQL as the primary database.

Do not use:

* SQLite as the production database
* in-memory storage
* JSON files as a database
* fake persistence

The application must work against a real PostgreSQL database.

Database configuration must come from environment variables.

Example:

```env
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/krishi_agritech"
```

Never hardcode database credentials inside application code.

---

# 5. ENVIRONMENT CONFIGURATION

Use environment-based configuration.

Expected configuration should follow this pattern:

```env
APP_NAME="Krishi AgriTech"
APP_ENV="development"
DEBUG=true

DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/krishi_agritech"

JWT_SECRET_KEY="change-me"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

REDIS_URL="redis://localhost:6379/0"

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-south-1"
S3_BUCKET_NAME=""

FRONTEND_URL="http://localhost:5173"
```

Do not expose secrets in source code.

Create/update:

```text
.env.example
```

with safe placeholder values.

Never commit:

```text
.env
credentials
private keys
AWS secrets
JWT production secrets
```

---

# 6. SECURITY IS A FIRST-CLASS REQUIREMENT

Security is not optional.

Follow `BEST_PRACTICES.md` for all security requirements.

At minimum implement:

## Authentication

* Secure password hashing
* JWT authentication
* Token expiration
* Protected routes
* Current-user dependency
* Proper authentication failure responses
* No plaintext passwords

## Authorization

Implement role-based access control.

Initial roles:

```text
ADMIN
FIELD_OFFICER
FARMER
```

Do not rely only on frontend route protection.

Every protected backend endpoint must enforce authorization.

The backend must never trust:

* user IDs
* farmer IDs
* field IDs
* role values
* ownership claims
* permissions

sent by the client without server-side validation.

---

# 7. SECURITY RULES

Never:

* Hardcode secrets
* Log passwords
* Log JWT secrets
* Return password hashes
* Trust client-provided roles
* Trust client-provided ownership
* Allow a farmer to access another farmer's data
* Allow a field officer to modify unauthorized resources
* Allow negative inventory
* Allow allocation greater than available inventory
* Allow arbitrary database IDs to bypass authorization
* Build SQL using string concatenation
* Disable validation to make an API work
* Expose internal exception details in production responses

Use:

* Parameterized SQL through SQLAlchemy
* Pydantic validation
* Proper HTTP status codes
* Authorization dependencies
* Transaction boundaries
* Database constraints
* Foreign keys
* Unique constraints where appropriate
* Check constraints where appropriate
* Server-side validation

---

# 8. ARCHITECTURE

Keep the backend modular.

A recommended structure:

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── api/
│   │   └── v1/
│   ├── services/
│   ├── repositories/
│   ├── dependencies/
│   └── utils/
│
├── alembic/
├── tests/
├── .env
├── .env.example
├── alembic.ini
├── pyproject.toml
└── README.md
```

You may adapt this structure if the existing repository has a better established architecture.

Do not create unnecessary abstraction layers.

Use services for business logic.

Do not put substantial business logic directly inside route handlers.

---

# 9. API VERSIONING

Use:

```text
/api/v1/
```

for backend APIs.

Example:

```text
/api/v1/auth/login
/api/v1/vendors
/api/v1/farmers
/api/v1/fields
```

Keep API versioning consistent.

---

# 10. PHASE 1 — BACKEND MVP

## Objective

Complete the first MVP backend completely.

Phase 1 includes:

1. Authentication
2. User roles
3. Vendor Registration
4. Vendor Seed Supply
5. Seed Batch
6. Seed Inventory
7. Farmer Registration
8. Multiple Field Registration
9. Field Polygon Mapping
10. Polygon Editing
11. Polygon Color
12. Seed Allocation to Field

The backend must be fully functional using PostgreSQL.

---

# 11. PHASE 1 DATABASE MODELS

Implement the necessary models for:

```text
User
Vendor
SeedSupply
SeedBatch
Farmer
Field
Season
SeedAllocation
```

You may introduce additional supporting tables if they are genuinely required.

Do not create unnecessary tables just for abstraction.

---

# 12. USERS AND ROLES

Implement:

```text
User
```

with appropriate fields such as:

```text
id
name
email / mobile
password_hash
role
is_active
created_at
updated_at
```

Use UUIDs where appropriate and consistent with project conventions.

Roles:

```text
ADMIN
FIELD_OFFICER
FARMER
```

Role must be validated server-side.

---

# 13. VENDOR MODULE

Implement Vendor CRUD.

Vendor fields:

```text
vendor_id
vendor_name
company_name
contact_person
mobile_number
email
address
gstin
status
created_at
updated_at
```

Status:

```text
ACTIVE
INACTIVE
```

Required APIs should include:

```text
POST   /api/v1/vendors
GET    /api/v1/vendors
GET    /api/v1/vendors/{vendor_id}
PATCH  /api/v1/vendors/{vendor_id}
DELETE /api/v1/vendors/{vendor_id}
```

Apply authorization.

---

# 14. SEED SUPPLY

A vendor can supply multiple seed batches.

Implement:

```text
SeedSupply
SeedBatch
```

Required information:

```text
vendor
crop
variety
batch_number
quantity
unit
supply_date
purchase/reference number
remarks
```

Every valid seed supply must result in an inventory/seed-batch record.

Do not allow duplicate batch numbers where business rules require uniqueness.

---

# 15. INVENTORY

Inventory must maintain:

```text
received quantity
allocated quantity
available quantity
```

Core rule:

```text
available = received - allocated
```

The backend must prevent:

```text
allocated > available
```

and:

```text
available < 0
```

Inventory modifications must happen inside a safe database transaction.

Do not rely only on frontend validation.

Handle concurrent allocation safely.

If two requests attempt to allocate the remaining inventory simultaneously, the database/business layer must prevent over-allocation.

---

# 16. FARMER MODULE

Implement Farmer CRUD.

Fields:

```text
farmer_id
name
mobile_number
address
village
block
district
state
status
registration_date
created_at
updated_at
```

A farmer must be a separate entity from fields.

One farmer can have multiple fields.

---

# 17. FIELD MODULE

Implement:

```text
Field
```

Fields should support:

```text
field_id
farmer_id
field_name
village
block
district
area
crop
season
status
latitude
longitude
polygon
polygon_color
created_at
updated_at
```

A farmer can have:

```text
1 → many Fields
```

The backend must verify that the authenticated user is authorized to access a field.

---

# 18. FIELD POLYGON

The frontend will provide polygon coordinates.

Backend must:

* Validate polygon structure.
* Store polygon safely.
* Allow authorized users to update it.
* Return polygon data through the API.
* Support editing.
* Support deleting/replacing the polygon.
* Preserve field ownership.

Prefer GeoJSON-compatible structure.

Do not trust client-provided calculated area.

If the backend calculates area, document the calculation method.

---

# 19. POLYGON COLOR

Support the business states defined by the product.

Example:

```text
GREEN  = Healthy / Active
YELLOW = Monitoring Required
RED    = Problem / Attention Required
BLUE   = Harvested / Completed
```

Allow authorized users to change the polygon color.

Use an enum rather than accepting arbitrary strings.

---

# 20. SEED ALLOCATION

Implement:

```text
POST /api/v1/seed-allocations
```

Allocation flow:

```text
Select Seed Batch
        ↓
Select Farmer
        ↓
Select Field
        ↓
Enter Quantity
        ↓
Validate
        ↓
Create Allocation
        ↓
Update Inventory
```

Validation must verify:

1. Seed batch exists.
2. Farmer exists.
3. Field exists.
4. Field belongs to farmer.
5. Seed batch has sufficient available quantity.
6. Quantity is positive.
7. Unit is valid.
8. User has permission.
9. Allocation and inventory update happen atomically.

The allocation must maintain traceability:

```text
Vendor
→ Seed Batch
→ Farmer
→ Field
```

---

# 21. ALEMBIC

All schema changes must use Alembic migrations.

Do not manually modify production database schemas.

The project should support:

```bash
alembic upgrade head
```

and fresh database setup.

Every model change must have an appropriate migration.

---

# 22. API DOCUMENTATION

FastAPI OpenAPI documentation must remain functional.

Use:

* Clear endpoint names
* Request schemas
* Response schemas
* Descriptions
* Appropriate status codes
* Authentication requirements
* Validation errors

Do not expose sensitive fields in API responses.

---

# 23. ERROR HANDLING

Implement consistent error handling.

Examples:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Business errors should return meaningful but safe messages.

Do not expose:

```text
stack traces
SQL queries
database credentials
internal filesystem paths
secrets
```

in normal API responses.

---

# 24. TRANSACTIONS

Business-critical operations must use transactions.

Especially:

```text
Seed Allocation
Inventory Update
```

The following must succeed or fail together:

```text
Create allocation
+
Decrease available inventory
+
Increase allocated quantity
```

Never leave the database in a partially updated state.

---

# 25. TESTING

Write automated tests.

At minimum cover:

## Authentication

* Login success
* Invalid password
* Missing credentials
* Expired/invalid token
* Protected endpoint without authentication

## Authorization

* Admin access
* Field Officer access
* Farmer access
* Unauthorized resource access

## Vendors

* Create vendor
* Get vendor
* Update vendor
* Validation

## Seed

* Create supply
* Create batch
* Inventory calculation
* Invalid quantity

## Farmers

* Create farmer
* Update farmer
* Validation

## Fields

* Create field
* Multiple fields for one farmer
* Polygon validation
* Polygon update
* Color validation

## Allocation

* Successful allocation
* Insufficient inventory
* Invalid farmer
* Invalid field
* Field belonging to another farmer
* Negative quantity
* Concurrent allocation / transaction safety

---

# 26. PHASE 1 ACCEPTANCE CRITERIA

Phase 1 is complete only when this entire flow works:

```text
Login
 ↓
Admin Dashboard/API
 ↓
Create Vendor
 ↓
Vendor Supplies Seed
 ↓
Seed Batch Created
 ↓
Inventory Updated
 ↓
Create Farmer
 ↓
Create Multiple Fields
 ↓
Create Field Polygon
 ↓
Edit Polygon
 ↓
Change Polygon Color
 ↓
Allocate Seed
 ↓
Inventory Automatically Decreases
 ↓
Trace Vendor
 ↓
Trace Batch
 ↓
Trace Farmer
 ↓
Trace Field
```

All data must persist in PostgreSQL.

All protected APIs must enforce authorization.

Tests must pass.

Alembic migrations must work.

---

# 27. PHASE 2 — FRONTEND API INTEGRATION

The existing Frontend already contains dummy/mock data.

Do NOT rebuild the frontend from scratch.

Do NOT unnecessarily redesign existing UI.

First inspect the existing frontend and identify:

```text
dummy data
mock services
hardcoded arrays
fake API functions
temporary IDs
local state representing backend entities
```

Replace these progressively with real backend APIs.

---

# 28. PHASE 2 INTEGRATION STRATEGY

Follow:

```text
Existing UI
     ↓
API Client
     ↓
FastAPI
     ↓
Service Layer
     ↓
PostgreSQL
```

Create a centralized API client.

Do not scatter raw `fetch()` calls throughout components.

Handle:

```text
authentication
authorization
loading
errors
pagination
filters
validation errors
token expiration
```

according to the existing frontend architecture and `BEST_PRACTICES.md`.

---

# 29. FRONTEND INTEGRATION ORDER

Integrate in this order:

```text
1. Authentication
2. Vendors
3. Seed Supply
4. Inventory
5. Farmers
6. Fields
7. Field Polygon
8. Polygon Color
9. Seed Allocation
```

After each module:

```text
Frontend
   ↓
Real API
   ↓
Database
   ↓
Real response
   ↓
UI update
```

Remove the corresponding dummy data only after the real API flow works.

---

# 30. DO NOT BREAK EXISTING FRONTEND

Before modifying a frontend feature:

1. Understand the current component.
2. Understand its data shape.
3. Understand its UI behavior.
4. Identify the dummy-data source.
5. Create/adjust API integration.
6. Map API response to existing UI.
7. Preserve existing UX unless a change is required.
8. Test the complete flow.

Do not make unrelated frontend refactors.

---

# 31. PHASE 3 — REMAINING FEATURES

After Phase 1 and Phase 2 are stable, implement the remaining MVP functionality.

Follow the original workflow and implement in this order.

## Crop Monitoring

```text
Crop Cycle
Crop Plan
Farmer Today's Plan
Manual Activity Entry
Fertilizer Tracking
Irrigation Tracking
Pesticide Tracking
Crop Photo Upload
7/15 Day Photo Monitoring
```

## Verification & Production

```text
Field Officer Visit
Activity Verification
Pest/Disease Reporting
Harvest
Production
Yield Calculation
Season Closure
Final Reports
```

These correspond to the remaining MVP phases.

---

# 32. CROP CYCLE

Implement:

```text
CropCycle
```

with:

```text
farmer
field
crop
variety
season
seed_batch
seed_quantity
sowing_date
expected_harvest_date
target_production
status
```

A crop cycle belongs to a specific field.

---

# 33. CROP PLAN

Implement planned activities.

Each plan item should support:

```text
activity
due date
instructions
recommended quantity
status
```

Statuses:

```text
PENDING
COMPLETED
SKIPPED
DELAYED
```

Do not force farmers to follow recommendations.

The system records planned vs actual activity.

---

# 34. FARMER ACTIVITY

Support:

```text
Land Preparation
Seed Treatment
Sowing
Irrigation
Fertilizer
Pesticide
Fungicide
Herbicide
Weeding
Pest/Disease
Field Inspection
Other
```

Actual activities must be linked to:

```text
Farmer
Field
Crop Cycle
```

where appropriate.

---

# 35. INPUT TRACKING

Implement separate tracking where appropriate for:

```text
Fertilizer
Irrigation
Pesticide / Fungicide
```

Maintain history.

Admin should be able to retrieve:

```text
Farmer-wise
Field-wise
Date-wise
Total usage
```

---

# 36. PHOTO STORAGE

When Crop Photo Upload is implemented:

Do not store large image binaries directly in PostgreSQL unless explicitly required.

Use object storage such as S3.

Store metadata in PostgreSQL:

```text
farmer
field
crop_cycle
uploaded_at
crop_stage
photo_url/key
remarks
activity_reference
```

Use secure upload/access patterns.

Do not expose AWS credentials to the frontend.

---

# 37. FIELD OFFICER VERIFICATION

Implement:

```text
FieldVisit
ActivityVerification
```

Officer should be able to record:

```text
observation
photo
remarks
verification status
```

Statuses may include:

```text
VERIFIED
NEEDS_REVIEW
```

Ensure the officer can only access resources they are authorized to access.

---

# 38. HARVEST AND PRODUCTION

Implement harvest records containing:

```text
farmer
field
crop_cycle
harvest_date
harvested_area
production_quantity
unit
quality
moisture
remarks
harvest_photo
```

Calculate:

```text
Yield per Acre =
Production / Cultivated Area
```

Do not trust a frontend-calculated yield.

Calculate important derived values on the backend.

---

# 39. SEASON CLOSURE

When closing a season:

* Validate required conditions.
* Prevent normal modifications after closure.
* Preserve historical data.
* Allow authorized admin reopening if required.
* Record closure information.

Do not physically delete historical season data.

---

# 40. REPORTING

Implement the required reports from the product specification.

At minimum:

```text
Vendor Report
Farmer Report
Field Report
Seed Report
Activity Report
Fertilizer Report
Irrigation Report
Production Report
```

Support CSV/Excel export where required.

Apply authorization to report endpoints.

Do not allow users to export data they are not authorized to access.

---

# 41. DASHBOARDS

Backend APIs should support:

## Admin Dashboard

Metrics such as:

```text
Total Vendors
Total Farmers
Total Fields
Total Cultivated Area
Total Seed Received
Total Seed Distributed
Remaining Seed
Active Crop Cycles
Pending Activities
Total Fertilizer Used
Total Irrigation
Total Production
```

## Farmer Dashboard

Support:

```text
Own profile
Own fields
Crop plan
Today's plan
Actual activities
Photos
Harvest
Production
```

## Field Officer Dashboard

Support:

```text
Assigned farmers
Assigned fields
Field visits
Verification
Observations
Photos
```

Do not return unnecessary data.

---

# 42. SEARCH AND FILTERING

Support the search/filter requirements defined by the product.

Examples:

```text
Farmer name
Farmer ID
Mobile
Vendor
Field ID
Village
Crop
Season
Crop stage
Field status
Activity status
Harvest status
```

Use server-side filtering for large datasets.

Do not fetch the entire database to the frontend just to filter it.

---

# 43. PAGINATION

List endpoints should support pagination where appropriate.

Example:

```text
?page=1&limit=20
```

Avoid unbounded database queries.

Use sensible maximum page sizes.

---

# 44. AUDITABILITY

For important operations, preserve enough information to answer:

```text
Who created it?
Who updated it?
When was it changed?
What resource was affected?
```

Especially for:

```text
Seed allocation
Inventory changes
Field changes
Verification
Harvest
Season closure
```

Implement a formal audit table if required by the best-practices document or if the implementation needs it.

---

# 45. DATA INTEGRITY

Use database constraints where possible.

Examples:

```text
Foreign keys
Unique constraints
Non-null constraints
Check constraints
Indexes
```

Do not rely exclusively on application-level validation for critical invariants.

---

# 46. PERFORMANCE

Do not prematurely optimize.

However:

* Add indexes for frequently queried foreign keys.
* Avoid N+1 queries.
* Use appropriate eager loading.
* Paginate large lists.
* Avoid unnecessary database calls.
* Keep transactions short.
* Do not load entire datasets into memory unnecessarily.

---

# 47. LOGGING

Implement useful structured application logging.

Logs should help diagnose:

```text
authentication failures
business operation failures
database failures
unexpected exceptions
important state transitions
```

Never log:

```text
passwords
JWT secrets
AWS secrets
full access tokens
sensitive personal information unnecessarily
```

---

# 48. API RESPONSE DESIGN

Keep API responses consistent.

Do not create completely different response formats for similar endpoints without a reason.

Use explicit Pydantic response schemas.

Never return SQLAlchemy model objects blindly.

---

# 49. DELETE OPERATIONS

Be careful with deletion.

Agricultural historical data is valuable.

Prefer:

```text
soft delete / inactive status
```

where deleting historical data would break traceability.

Do not cascade-delete important historical records accidentally.

---

# 50. AI CODING AGENT WORKFLOW

You are an implementation agent, not a one-shot code generator.

For every major task:

### Step 1

Inspect the relevant code.

### Step 2

Understand existing architecture.

### Step 3

Identify dependencies.

### Step 4

Create a short implementation plan.

### Step 5

Implement.

### Step 6

Run formatting/linting/type checks if configured.

### Step 7

Run tests.

### Step 8

Fix failures.

### Step 9

Review security implications.

### Step 10

Summarize exactly what changed.

Do not skip testing.

---

# 51. BEFORE MODIFYING ANY FILE

Check:

```text
Does this already exist?
Is there an existing abstraction?
Is there an existing component?
Is there an existing utility?
Will this duplicate functionality?
Will this break an existing API?
```

Prefer extending existing code over creating duplicates.

---

# 52. NO RANDOM TECHNOLOGIES

Do not introduce:

* New frameworks
* New databases
* New authentication systems
* New state-management libraries
* New cloud services
* New ORM
* New architectural patterns

unless there is a clear technical reason.

If a new dependency is necessary:

1. Explain why.
2. Explain the alternative.
3. Keep the dependency minimal.
4. Update dependency files correctly.

---

# 53. NO PLACEHOLDER IMPLEMENTATIONS

Do not mark functionality as complete using:

```text
TODO
pass
mock response
fake database
hardcoded result
dummy API
temporary bypass
```

unless the task explicitly requests a temporary scaffold.

If a feature cannot be completed, clearly report what is missing.

---

# 54. DO NOT HIDE ERRORS

Never make a failing implementation appear successful.

For example, do not:

```python
try:
    ...
except Exception:
    return []
```

unless that behavior is explicitly intended and properly logged.

Errors should be handled intentionally.

---

# 55. MIGRATION SAFETY

Before changing database models:

1. Inspect current schema.
2. Update SQLAlchemy models.
3. Generate/update Alembic migration.
4. Review migration.
5. Run migration.
6. Run tests.

Never blindly generate destructive migrations.

---

# 56. GIT SAFETY

Do not:

* Delete unrelated files.
* Rewrite unrelated code.
* Reset user work.
* Remove existing features without permission.
* Commit secrets.
* Commit `.env`.

Keep changes focused.

Use meaningful commits if the environment/workflow expects commits.

---

# 57. DEVELOPMENT ORDER

Follow this sequence.

## PHASE 1

```text
Repository Analysis
↓
Backend Setup
↓
Configuration
↓
PostgreSQL
↓
SQLAlchemy
↓
Alembic
↓
User/Auth
↓
RBAC
↓
Vendor
↓
Seed Supply
↓
Seed Batch
↓
Inventory
↓
Farmer
↓
Field
↓
Polygon
↓
Polygon Color
↓
Seed Allocation
↓
Tests
```

## PHASE 2

```text
Inspect Existing Frontend
↓
API Client
↓
Authentication Integration
↓
Vendor Integration
↓
Seed Integration
↓
Inventory Integration
↓
Farmer Integration
↓
Field Integration
↓
Map Integration
↓
Seed Allocation Integration
↓
Remove Corresponding Dummy Data
↓
End-to-End Testing
```

## PHASE 3

```text
Crop Cycle
↓
Crop Plan
↓
Farmer Activities
↓
Fertilizer
↓
Irrigation
↓
Pesticide
↓
Crop Photos
↓
Field Officer
↓
Verification
↓
Pest/Disease
↓
Harvest
↓
Production
↓
Yield
↓
Season Closure
↓
Reports
↓
Search / Filters
↓
Dashboard Completion
```

---

# 58. MVP EXCLUSIONS

Do NOT implement these as part of the current MVP unless explicitly requested:

```text
IoT sensors
Automatic fertilizer detection
Automatic irrigation detection
AI crop disease detection
AI recommendations
Weather API
Mandi API
WhatsApp integration
SMS automation
Voice input
Advanced satellite NDVI
Automatic GPS tracking
Complex accounting
Farmer ranking/scoring
```

Do not expand scope on your own.

---

# 59. IMPORTANT PRODUCT RULE

The MVP must NOT create farmer rankings or performance scores.

The system is for operational tracking and traceability.

Do not introduce scoring logic.

---

# 60. DEFINITION OF DONE

A feature is considered complete only when:

* Backend implementation exists.
* Database model exists where required.
* Alembic migration exists.
* Pydantic schemas exist.
* API endpoint exists.
* Authentication/authorization is enforced.
* Business rules are implemented.
* Error handling exists.
* Tests exist.
* Tests pass.
* API documentation is correct.
* Existing functionality is not broken.
* No secrets are exposed.
* No unnecessary dummy data remains for that feature.
* Frontend integration works when the task belongs to Phase 2.
* Code follows `BEST_PRACTICES.md`.

---

# 61. FINAL END-TO-END ACCEPTANCE FLOW

The completed system must eventually support:

```text
ADMIN LOGIN
    ↓
VENDOR REGISTRATION
    ↓
VENDOR SUPPLIES SEED
    ↓
SEED BATCH CREATED
    ↓
SEED INVENTORY
    ↓
FARMER REGISTRATION
    ↓
MULTIPLE FIELDS
    ↓
FIELD POLYGON
    ↓
POLYGON EDIT / COLOR
    ↓
CROP CYCLE
    ↓
SEED ALLOCATION
    ↓
CROP PLAN
    ↓
FARMER TODAY'S PLAN
    ↓
FARMER ACTIVITY
    ↓
FERTILIZER / IRRIGATION / PESTICIDE
    ↓
CROP PHOTOS
    ↓
FIELD OFFICER VERIFICATION
    ↓
PEST / DISEASE REPORT
    ↓
HARVEST
    ↓
PRODUCTION
    ↓
YIELD
    ↓
SEASON CLOSURE
    ↓
FINAL REPORT
```

At every stage, maintain traceability.

---

# 62. FIRST TASK

Do NOT immediately start implementing the entire application.

Your first task is:

### Repository + Requirements Analysis

Inspect:

```text
Project structure
Existing backend
Existing frontend
Package files
Environment configuration
Database configuration
Existing components
Existing dummy data
API-related code
Maps implementation
Authentication implementation
MVP workflow
BEST_PRACTICES.md
```

Then provide:

```text
1. Current architecture
2. Existing frontend modules
3. Existing backend modules
4. Existing dummy-data sources
5. Missing backend functionality
6. Required database models
7. Required API modules
8. Security concerns
9. Phase 1 implementation plan
10. Phase 2 integration plan
11. Risks / ambiguities
```

Do not modify code during this analysis step unless explicitly instructed.

After the analysis, begin **Phase 1** incrementally.

---

# 63. FINAL RULE

Build this as a real production-oriented application, not as a tutorial demo.

Prioritize:

```text
Correctness
Security
Data Integrity
Traceability
Maintainability
Testability
Clear APIs
Simple Architecture
```

Do not optimize for writing the most code.

Optimize for building a system that can be trusted with real agricultural operational data.
