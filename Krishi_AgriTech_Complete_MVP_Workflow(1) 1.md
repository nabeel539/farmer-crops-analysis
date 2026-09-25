# 🌾 Krishi AgriTech — Complete MVP Workflow

## 1. System Objective

Krishi AgriTech is an Agriculture Farmer & Crop Management System designed to manage the complete lifecycle of agricultural operations:

**Vendor → Seed Supply → Seed Inventory → Farmer → Multiple Fields → Seed Allocation → Crop Plan → Farmer Activities → Photo Monitoring → Field Verification → Harvest → Production → Season Closure**

The primary goal is to give Admin/Management complete visibility into:

- Vendor-wise seed supply
- Seed inventory
- Farmer details
- Multiple fields/bilas owned or cultivated by each farmer
- Field polygon mapping
- Seed allocation to specific farmers and fields
- Crop plans and recommendations
- Farmer-reported activities
- Fertilizer and irrigation usage
- Periodic crop photos
- Field officer verification
- Harvest quantity
- Final production and yield

---

# 2. User Roles

## 2.1 Admin / Management

Admin can:

- Register vendors
- Manage vendors
- View vendor seed supply
- Manage seed inventory
- Register farmers
- Manage farmer profiles
- Create and manage multiple fields for a farmer
- Create/edit field polygons
- Change field polygon colors
- Allocate seed to farmers/fields
- Create crop plans
- Monitor farmer activities
- View crop photos
- Monitor planned vs actual activities
- View field officer verification
- View harvest and production
- Close a season
- View final season reports

## 2.2 Field Officer / Agronomist

Field Officer can:

- View assigned farmers
- View farmer fields
- View field polygons
- Conduct field visits
- Verify farmer activities
- Add field observations
- Upload field/crop photos
- Verify fertilizer/pesticide/irrigation activities
- Add remarks
- Update crop condition

## 2.3 Farmer

Farmer can:

- View own profile
- View own fields
- View crop plan
- View recommended activities
- Manually update completed activities
- Add fertilizer usage
- Add irrigation
- Add pesticide usage
- Upload crop photos
- Report pest/disease
- Add additional activities
- View activity history
- Enter harvest details
- Enter production

---

# 3. Vendor Registration

Create a **Vendor Management** module.

## Vendor Fields

- Vendor ID
- Vendor Name
- Company Name
- Contact Person
- Mobile Number
- Email
- Address
- GSTIN (optional)
- Status
  - Active
  - Inactive
- Created Date

Example:

```text
Vendor ID: V-001
Vendor: ABC Seeds Pvt Ltd
Contact Person: Rajesh Kumar
Mobile: XXXXXXXX
Status: Active
```

---

# 4. Vendor Seed Supply

A vendor can supply multiple seed batches.

## Seed Supply Fields

- Vendor
- Seed Type
- Crop
- Variety
- Batch Number
- Quantity
- Unit
- Supply Date
- Purchase/Reference Number
- Remarks

Example:

```text
Vendor: ABC Seeds Pvt Ltd
Crop: Wheat
Variety: HD-2967
Batch No: WHT-2026-001
Quantity: 1,000 KG
Supply Date: 24 Sep 2026
```

Every seed supply must create an inventory record.

---

# 5. Seed Inventory

Track all incoming and outgoing seed.

## Inventory Flow

```text
Vendor
   ↓
Seed Supply
   ↓
Seed Batch
   ↓
Company Inventory
   ↓
Farmer/Field Allocation
```

Example:

```text
Total Seed Received: 2,500 KG

Distributed:
Farmer A → 50 KG
Farmer B → 75 KG
Farmer C → 100 KG

Remaining:
2,275 KG
```

## Inventory Table

| Batch | Vendor | Crop | Variety | Received | Distributed | Available |
|---|---|---|---|---:|---:|---:|
| WHT-001 | ABC Seeds | Wheat | HD-2967 | 1000 KG | 400 KG | 600 KG |
| WHT-002 | XYZ Seeds | Wheat | HD-2967 | 1500 KG | 0 KG | 1500 KG |

Admin should be able to trace:

**Vendor → Batch → Farmer → Field**

---

# 6. Farmer Registration

Register farmers independently from their fields.

## Farmer Fields

- Farmer ID
- Name
- Mobile Number
- Address
- Village
- Block
- District
- State
- Aadhaar/CNIC (only if required)
- Status
- Registration Date

Example:

```text
Farmer ID: F-001
Name: Ramesh Kumar
Mobile: XXXXXXXX
Village: ABC Village
Block: XYZ
District: Khordha
Status: Active
```

---

# 7. Multiple Fields / Bilas per Farmer

A farmer can cultivate multiple fields.

**Important: Farmer and Field must be separate entities.**

Example:

```text
Farmer: Ramesh Kumar

Field 1 → 2.0 Acre
Field 2 → 3.0 Acre
Field 3 → 1.5 Acre

Total Area → 6.5 Acre
```

A farmer may have 1, 2, 3 or more fields.

Each field must have its own:

- Field ID
- Field name
- Area
- Polygon
- Crop
- Season
- Seed allocation
- Crop plan
- Activities
- Photos
- Harvest
- Production

---

# 8. Field / Bila Creation

Admin or Field Officer can create a field.

## Field Information

- Field ID
- Farmer
- Field Name
- Village
- Block
- District
- Area
- Crop
- Season
- Status
- Latitude/Longitude
- Polygon Coordinates

Example:

```text
Farmer: Ramesh Kumar
Field: Ramesh Field 01
Area: 2.10 Acre
Crop: Wheat
Season: 2026-27
Status: Active
```

---

# 9. Field Polygon Mapping

Use an interactive map for field mapping.

Admin/authorized user should be able to:

- Draw polygon
- Edit polygon
- Move polygon points
- Delete polygon
- Save polygon
- View field boundary
- View calculated area
- Change polygon color

## Polygon Color Meaning

Example:

- 🟢 Green = Active/Healthy
- 🟡 Yellow = Monitoring Required
- 🔴 Red = Problem/Attention Required
- 🔵 Blue = Harvested/Completed

Admin must be able to manually change the field polygon color.

---

# 10. Seed Allocation to Farmer and Field

Seed must be allocated from inventory to a specific farmer and field.

## Allocation Flow

```text
Seed Inventory
      ↓
Select Farmer
      ↓
Select Field
      ↓
Select Seed Batch
      ↓
Enter Quantity
      ↓
Allocate
```

Example:

```text
Vendor: ABC Seeds
Batch: WHT-2026-001

Farmer: Ramesh
Field: Field 01
Quantity: 50 KG
Date: 24 Sep 2026
```

The system automatically reduces available inventory.

---

# 11. Crop Cycle

After field creation and seed allocation, create a crop cycle.

## Crop Cycle Fields

- Farmer
- Field
- Crop
- Variety
- Season
- Seed Batch
- Seed Quantity
- Sowing Date
- Expected Harvest Date
- Target Production
- Status

Example:

```text
Farmer: Ramesh Kumar
Field: Field 01
Crop: Wheat
Variety: HD-2967
Season: 2026-27
Area: 2 Acre
Seed: 50 KG
Sowing Date: 10 Nov 2026
```

---

# 12. Crop Plan / Farming Plan

After crop cycle creation, Admin/Agronomist can create a farming plan.

The plan tells the farmer:

- What activity to do
- When to do it
- Recommended quantity (if applicable)
- Instructions
- Due date
- Status

Example:

| Day | Activity | Recommendation |
|---:|---|---|
| Day 0 | Sowing | Complete sowing |
| Day 7 | Field Check | Check germination |
| Day 15 | Irrigation | Check soil moisture |
| Day 20 | Fertilizer | Apply recommended fertilizer |
| Day 30 | Weed Check | Check weeds |
| Day 45 | Irrigation | Monitor field moisture |
| Day 60 | Crop Inspection | Upload crop photo |
| Day 75 | Disease Check | Check pest/disease |
| Day 90 | Crop Monitoring | Upload photo |
| Harvest | Harvest | Record production |

---

# 13. Farmer Today's Plan

Farmer dashboard should show upcoming and pending tasks.

Example:

```text
Today's Plan
24 September

☐ Irrigation
☐ Field Inspection
☐ Apply Fertilizer
☐ Upload Crop Photo
```

Each task should show:

- Activity name
- Due date
- Instructions
- Optional recommended quantity
- Status

## Activity Status

- Pending
- Completed
- Skipped
- Delayed

The farmer is not forced to follow the recommendation.

The farmer can:

- Complete
- Skip
- Do later
- Add another activity manually

---

# 14. Farmer Manual Activity Logging

Farmers will manually update their actual farming activities.

## Activity Types

- Land Preparation
- Seed Treatment
- Sowing
- Irrigation
- Fertilizer
- Pesticide
- Fungicide
- Herbicide
- Weeding
- Pest/Disease
- Field Inspection
- Other

## Activity Fields

- Field
- Activity Type
- Date
- Quantity (if applicable)
- Unit
- Description
- Remarks
- Photo (optional)

Example:

```text
Field: Field 01
Activity: Fertilizer
Product: Urea
Quantity: 20 KG
Date: 24 Sep 2026
Remarks: Applied after irrigation
```

---

# 15. Fertilizer Tracking

Farmer manually records fertilizer usage.

## Fertilizer Fields

- Farmer
- Field
- Fertilizer
- Quantity
- Unit
- Date
- Remarks

Examples:

```text
Urea → 20 KG
DAP → 10 KG
MOP → 15 KG
NPK → 25 KG
```

Admin should see:

- Farmer-wise fertilizer usage
- Field-wise fertilizer usage
- Date-wise usage
- Total fertilizer used

---

# 16. Irrigation Tracking

Farmer manually records irrigation.

## Fields

- Farmer
- Field
- Date
- Water Source
- Duration
- Water Quantity (optional)
- Remarks

Example:

```text
Field: Field 01
Date: 25 Sep 2026
Water Source: Tube Well
Duration: 2 Hours
Remarks: First irrigation
```

Admin can see:

- Total irrigation count
- Last irrigation date
- Irrigation history
- Field-wise irrigation

---

# 17. Pesticide / Fungicide Tracking

Farmer can manually record:

- Product
- Type
- Quantity
- Unit
- Date
- Reason
- Remarks

Example:

```text
Product: Fungicide A
Type: Fungicide
Quantity: 2 L
Date: 10 Dec 2026
Reason: Disease prevention
```

---

# 18. Crop Photo Monitoring

Admin can configure a photo monitoring frequency.

Options:

- Every 7 days
- Every 15 days

Example:

```text
Day 15 → Photo Required
Day 30 → Photo Required
Day 45 → Photo Required
Day 60 → Photo Required
Day 75 → Photo Required
```

Farmer receives a task/reminder to upload a photo.

## Photo Data

Each photo should save:

- Farmer
- Field
- Crop Cycle
- Date
- Time
- Crop Stage
- Photo
- Optional remarks
- Activity/Plan reference

---

# 19. Crop Growth Photo Timeline

Admin should see chronological crop photos.

Example:

```text
10 Nov
📷 Sowing Stage

25 Nov
📷 Germination

10 Dec
📷 Vegetative Growth

25 Dec
📷 Tillering

10 Jan
📷 Flowering

25 Jan
📷 Grain Filling

10 Feb
📷 Maturity

20 Feb
📷 Harvest
```

This allows management to visually monitor crop development.

---

# 20. Planned vs Actual Activity

The system should compare the crop plan with farmer's actual activities.

Example:

### Planned

```text
24 Sep
Irrigation
```

### Actual

```text
25 Sep
Irrigation Completed
```

Admin should be able to see:

```text
Planned Activities: 20
Completed: 15
Pending: 5
Skipped: 2
Delayed: 3
```

Do not create a farmer ranking or performance score in the MVP.

---

# 21. Field Officer Verification

Field Officer can visit a field and verify farmer activities.

## Verification

Example:

```text
Planned:
Urea – 20 KG

Farmer Reported:
Urea – 20 KG

Officer:
Verified ✓
```

If there is a difference:

```text
Farmer Reported: 20 KG
Officer Observation: Different

Status: Needs Review
```

Officer can add:

- Observation
- Photo
- Remarks
- Verification status

---

# 22. Pest / Disease Reporting

Farmer or Field Officer can report a problem.

## Fields

- Field
- Problem Type
- Description
- Date
- Photo
- Remarks

Example:

```text
Problem: Yellow Rust
Field: Field 02
Date: 12 Jan 2027
Photo: Uploaded
Remarks: Disease noticed in crop
```

Admin can see problem fields on the dashboard.

---

# 23. Admin Monitoring Dashboard

The Admin dashboard should provide an overall view.

## Summary Cards

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

---

# 24. Farmer Dashboard for Admin

Admin should be able to open any farmer and see:

```text
Farmer Profile
        ↓
Total Land Area
        ↓
All Fields
        ↓
Seed Received
        ↓
Crop Cycles
        ↓
Crop Plan
        ↓
Planned Activities
        ↓
Actual Activities
        ↓
Fertilizer Usage
        ↓
Irrigation History
        ↓
Pesticide Usage
        ↓
Crop Photos
        ↓
Field Officer Visits
        ↓
Harvest
        ↓
Production
        ↓
Yield per Acre
```

---

# 25. Farmer Field List

Example:

```text
Ramesh Kumar

Total Fields: 3
Total Area: 6.5 Acre

┌─────────────────────────┐
│ Field 01                │
│ Area: 2.0 Acre          │
│ Crop: Wheat             │
│ Stage: Vegetative       │
│ Status: Active          │
└─────────────────────────┘

┌─────────────────────────┐
│ Field 02                │
│ Area: 3.0 Acre          │
│ Crop: Wheat             │
│ Stage: Flowering        │
│ Status: Active          │
└─────────────────────────┘

┌─────────────────────────┐
│ Field 03                │
│ Area: 1.5 Acre          │
│ Crop: Wheat             │
│ Stage: Sowing           │
│ Status: Active          │
└─────────────────────────┘
```

---

# 26. Harvest Management

At the end of the season, farmer or Field Officer records harvest.

## Harvest Fields

- Farmer
- Field
- Crop Cycle
- Harvest Date
- Harvested Area
- Production Quantity
- Unit
- Quality
- Moisture (optional)
- Remarks
- Harvest Photo

Example:

```text
Farmer: Ramesh Kumar
Field: Field 01
Area: 2 Acre

Harvest Date: 20 Mar 2027
Production: 28 Quintal
Harvested Area: 2 Acre
Quality: A
```

---

# 27. Production Calculation

Automatically calculate:

```text
Yield per Acre =
Total Production / Cultivated Area
```

Example:

```text
Area = 2 Acre
Production = 28 Quintal

Yield = 14 Quintal/Acre
```

For a farmer with multiple fields, show:

- Field-wise production
- Farmer total production
- Farmer average yield

---

# 28. Season Closure

After all fields are harvested, Admin can close the season.

Before closing, show a summary.

Example:

```text
WHEAT SEASON 2026-27

Farmer:
Ramesh Kumar

Total Fields:
3

Total Area:
6.5 Acre

Seed Received:
150 KG

Fertilizer:
Urea – 40 KG
DAP – 30 KG

Irrigation:
6

Crop Photos:
8

Total Production:
82 Quintal

Average Yield:
12.61 Quintal/Acre
```

Admin can then select:

**Close Season**

After closing:

- No normal edits should be allowed
- Admin can reopen the season if necessary
- All season data remains available for reporting

---

# 29. Final Season Report

Create a complete season report.

## Overall Summary

```text
WHEAT SEASON 2026-27

Total Vendors: 5
Total Seed Received: 10,000 KG
Total Farmers: 150
Total Fields: 230
Total Cultivated Area: 520 Acre
Total Seed Distributed: 9,500 KG
Total Production: 6,240 Quintal
Average Yield: XX Quintal/Acre
```

## Drill-Down

Admin should be able to navigate:

```text
Vendor
  ↓
Seed Batch
  ↓
Farmer
  ↓
Field
  ↓
Crop Cycle
  ↓
Crop Plan
  ↓
Activities
  ↓
Inputs
  ↓
Photos
  ↓
Verification
  ↓
Harvest
  ↓
Production
```

---

# 30. Reports

Create the following reports:

## Vendor Report

- Vendor
- Seed supplied
- Batch
- Date
- Remaining quantity

## Farmer Report

- Farmer
- Village
- Total fields
- Total area
- Seed received
- Crop stage
- Production

## Field Report

- Field
- Farmer
- Area
- Polygon
- Crop
- Seed
- Crop stage
- Activities
- Production

## Seed Report

- Vendor
- Batch
- Received
- Distributed
- Remaining

## Activity Report

- Farmer
- Field
- Activity
- Date
- Quantity
- Status

## Fertilizer Report

- Farmer
- Field
- Fertilizer
- Quantity
- Date

## Irrigation Report

- Farmer
- Field
- Date
- Water source
- Duration

## Production Report

- Farmer
- Field
- Area
- Production
- Yield/Acre

Allow CSV/Excel export.

---

# 31. Map Dashboard

Admin should have a map view showing all fields.

Each field should be displayed as a polygon.

Clicking a polygon should show:

```text
Farmer
Field
Area
Crop
Crop Stage
Seed Allocated
Last Activity
Last Photo
Production
```

Admin can:

- Edit polygon
- Change color
- View field
- Open farmer details

---

# 32. Search & Filters

Admin can search by:

- Farmer Name
- Farmer ID
- Mobile
- Vendor
- Field ID
- Village

Filters:

- Vendor
- Farmer
- Village
- Crop
- Season
- Crop Stage
- Field Status
- Activity Status
- Harvest Status

---

# 33. Recommended Data Structure

Use a modular structure.

```text
vendors
  └── seedSupplies

seedBatches

farmers
  └── fields
       └── cropCycles
            ├── cropPlans
            ├── activities
            ├── fertilizerUsage
            ├── irrigationRecords
            ├── pesticideUsage
            ├── cropPhotos
            ├── fieldVisits
            └── harvests

seasons

users
```

Important relationships:

```text
Vendor
   ↓
Seed Batch
   ↓
Inventory
   ↓
Farmer
   ↓
Field
   ↓
Crop Cycle
   ↓
Crop Plan
   ↓
Actual Activities
   ↓
Harvest
   ↓
Production
```

---

# 34. Core Business Rule

The system must maintain complete traceability:

> **Which vendor supplied the seed → which batch it came from → how much seed was received → which farmer received it → which field received it → what crop plan was assigned → what the farmer actually did → what photos were uploaded → what the field officer verified → how much production was achieved.**

---

# 35. MVP Priority

## Phase 1 — Foundation

1. Vendor Registration
2. Vendor Seed Supply
3. Seed Inventory
4. Farmer Registration
5. Multiple Field Registration
6. Field Polygon Mapping
7. Polygon Edit
8. Polygon Color Change
9. Seed Allocation to Field

## Phase 2 — Crop Monitoring

10. Crop Cycle
11. Crop Plan
12. Farmer Today's Plan
13. Manual Activity Entry
14. Fertilizer Tracking
15. Irrigation Tracking
16. Pesticide Tracking
17. Crop Photo Upload
18. 7/15 Day Photo Monitoring

## Phase 3 — Verification & Production

19. Field Officer Visit
20. Activity Verification
21. Pest/Disease Reporting
22. Harvest
23. Production
24. Yield Calculation
25. Season Closure
26. Final Reports

---

# 36. MVP Exclusions

Do NOT implement these in the initial MVP:

- IoT sensors
- Automatic fertilizer detection
- Automatic irrigation detection
- AI crop disease detection
- AI recommendations
- Weather API
- Mandi API
- WhatsApp integration
- SMS automation
- Voice input
- Advanced satellite NDVI
- Automatic GPS tracking
- Complex accounting
- Farmer ranking/scoring

These can be added in future versions.

---

# 37. Final End-to-End Workflow

```text
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
CREATE MULTIPLE FIELDS
        ↓
DRAW FIELD POLYGON
        ↓
EDIT / COLOR FIELD POLYGON
        ↓
CREATE CROP CYCLE
        ↓
ALLOCATE SEED TO FARMER/FIELD
        ↓
CREATE FARMING PLAN
        ↓
FARMER VIEWS TODAY'S PLAN
        ↓
FARMER MANUALLY RECORDS ACTIVITY
        ↓
FERTILIZER / IRRIGATION / PESTICIDE ENTRY
        ↓
EVERY 7/15 DAYS CROP PHOTO
        ↓
FIELD OFFICER VISIT & VERIFICATION
        ↓
ADMIN MONITORS ALL ACTIVITIES
        ↓
HARVEST
        ↓
PRODUCTION ENTRY
        ↓
YIELD PER ACRE
        ↓
SEASON CLOSURE
        ↓
FINAL SEASON REPORT
```

# 38. Main Admin Question the System Should Answer

At any time, Admin should be able to answer:

1. Which vendors supplied seeds?
2. How much seed did each vendor supply?
3. Which batch did the seed come from?
4. How much seed is currently available?
5. Which farmer received the seed?
6. Which field received the seed?
7. How many fields does each farmer cultivate?
8. What is the area of each field?
9. What is the field polygon/location?
10. What crop is being cultivated?
11. What is the current crop stage?
12. What was planned for the farmer?
13. What did the farmer actually do?
14. How much fertilizer was used?
15. How many irrigations were done?
16. What pesticides/fungicides were used?
17. Are regular crop photos being uploaded?
18. What did the Field Officer verify?
19. How much was harvested?
20. What was the final production?
21. What was the yield per acre?
22. What was the complete performance/history of the field during the season?
