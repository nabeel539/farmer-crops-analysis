"""Seed script to initialize PostgreSQL database with tables and complete demo records."""
from sqlalchemy import select
from app.core.database import engine, SessionLocal, Base
from app.core.security import hash_password

# Import all models to register with Base
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.seed import SeedSupply, SeedBatch
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor
from app.models.allocation import SeedAllocation
from app.models.crop_cycle import CropCycle, CropCycleStage, CropHealthStatus
from app.models.activity import Activity, ActivityType, ActivityStatus
from app.models.visit import OfficerVisit, VisitType, VerificationStatus
from app.models.harvest import HarvestRecord, HarvestMethod, GrainQualityGrade, HarvestStatus


def init_db():
    print("Creating all tables in PostgreSQL database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

    db = SessionLocal()
    try:
        # 1. Admin User
        admin = db.execute(select(User).where(User.email == "admin@krishi.com")).scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@krishi.com",
                name="Agritech System Administrator",
                password_hash=hash_password("admin1234"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("Seeded Admin: admin@krishi.com (password: admin1234)")
        else:
            admin.password_hash = hash_password("admin1234")
            db.commit()

        # 2. Field Officer
        officer = db.execute(select(User).where(User.email == "officer@krishi.com")).scalar_one_or_none()
        if not officer:
            officer = User(
                email="officer@krishi.com",
                name="Rajesh Kumar (Field Officer)",
                password_hash=hash_password("officer1234"),
                role=UserRole.FIELD_OFFICER,
                is_active=True
            )
            db.add(officer)
            db.commit()
            db.refresh(officer)
            print("Seeded Field Officer: officer@krishi.com (password: officer1234)")
        else:
            officer.password_hash = hash_password("officer1234")
            db.commit()

        # 3. Farmer Users
        farmer_user1 = db.execute(select(User).where((User.email == "ramesh@krishi.com") | (User.mobile == "9812345678"))).scalar_one_or_none()
        if not farmer_user1:
            farmer_user1 = User(
                email="ramesh@krishi.com",
                mobile="9812345678",
                name="Ramesh Patel",
                password_hash=hash_password("farmer1234"),
                role=UserRole.FARMER,
                is_active=True
            )
            db.add(farmer_user1)
            db.commit()
            print("Seeded Farmer User: ramesh@krishi.com / 9812345678 (password: farmer1234)")
        else:
            farmer_user1.password_hash = hash_password("farmer1234")
            db.commit()

        farmer_user2 = db.execute(select(User).where((User.email == "gurpreet@krishi.com") | (User.mobile == "9814054321"))).scalar_one_or_none()
        if not farmer_user2:
            farmer_user2 = User(
                email="gurpreet@krishi.com",
                mobile="9814054321",
                name="Sardar Gurpreet Singh",
                password_hash=hash_password("farmer1234"),
                role=UserRole.FARMER,
                is_active=True
            )
            db.add(farmer_user2)
            db.commit()
            print("Seeded Farmer User: gurpreet@krishi.com / 9814054321 (password: farmer1234)")
        else:
            farmer_user2.password_hash = hash_password("farmer1234")
            db.commit()

        # 4. Seed Vendor
        vendor = db.execute(select(Vendor).where(Vendor.company_name == "Punjab Agri Seed Corp")).scalar_one_or_none()
        if not vendor:
            vendor = Vendor(
                vendor_name="Harpreet Singh",
                company_name="Punjab Agri Seed Corp",
                contact_person="Harpreet Singh",
                mobile_number="9876543210",
                email="contact@punjabseeds.com",
                address="GT Road, Ludhiana, Punjab",
                gstin="03ABCDE1234F1Z5",
                status=VendorStatus.ACTIVE
            )
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
            print(f"Seeded Vendor: {vendor.company_name}")

        # 5. Seed Supply & Batch
        supply = db.execute(select(SeedSupply).where(SeedSupply.vendor_id == vendor.id)).scalar_one_or_none()
        if not supply:
            supply = SeedSupply(
                vendor_id=vendor.id,
                crop="Wheat",
                variety="HD-3086 (Pusa Gautami)",
                supply_date="2025-10-15",
                purchase_reference="PO-2025-0089",
                remarks="Certified high-germination foundation wheat batch"
            )
            db.add(supply)
            db.commit()
            db.refresh(supply)

            batch = SeedBatch(
                supply_id=supply.id,
                batch_number="BATCH-2025-HD3086-01",
                quantity=2000.0,
                unit="KG",
                received_quantity=2000.0,
                allocated_quantity=400.0,
                available_quantity=1600.0
            )
            db.add(batch)
            db.commit()
            db.refresh(batch)
            print(f"Seeded Seed Supply & Batch: {batch.batch_number} (2000 KG)")
        else:
            batch = db.execute(select(SeedBatch).where(SeedBatch.supply_id == supply.id)).scalar_one_or_none()

        # 6. Farmers Registry
        farmer1 = db.execute(select(Farmer).where(Farmer.mobile_number == "9814054321")).scalar_one_or_none()
        if not farmer1:
            farmer1 = Farmer(
                name="Sardar Gurpreet Singh",
                mobile_number="9814054321",
                address="Gill Kalan, Near Gurdwara",
                village="Gill Kalan",
                block="Ludhiana West",
                district="Ludhiana",
                state="Punjab",
                status=FarmerStatus.ACTIVE,
                registration_date="2025-09-15"
            )
            db.add(farmer1)
            db.commit()
            db.refresh(farmer1)
            print(f"Seeded Farmer: {farmer1.name} ({farmer1.village})")

        farmer2 = db.execute(select(Farmer).where(Farmer.mobile_number == "9812345678")).scalar_one_or_none()
        if not farmer2:
            farmer2 = Farmer(
                name="Ramesh Patel",
                mobile_number="9812345678",
                address="Near Main Canal, Rampur",
                village="Rampur",
                block="Nilokheri",
                district="Karnal",
                state="Haryana",
                status=FarmerStatus.ACTIVE,
                registration_date="2025-09-20"
            )
            db.add(farmer2)
            db.commit()
            db.refresh(farmer2)
            print(f"Seeded Farmer: {farmer2.name} ({farmer2.village})")

        # 7. GIS Land Parcels
        field1 = db.execute(select(Field).where(Field.farmer_id == farmer1.id)).scalar_one_or_none()
        if not field1:
            field1 = Field(
                farmer_id=farmer1.id,
                field_name="Gill Kalan North Block #1",
                village="Gill Kalan",
                block="Ludhiana West",
                district="Ludhiana",
                area=10.0,
                crop="Wheat",
                season="Rabi 2025-26",
                status=FieldStatus.ACTIVE,
                latitude=30.9010,
                longitude=75.8573,
                polygon={
                    "type": "Polygon",
                    "coordinates": [[
                        [75.8570, 30.9010],
                        [75.8585, 30.9010],
                        [75.8585, 30.9025],
                        [75.8570, 30.9025],
                        [75.8570, 30.9010]
                    ]]
                },
                polygon_color=PolygonColor.GREEN,
                notes="Primary irrigated wheat field with high soil moisture"
            )
            db.add(field1)
            db.commit()
            db.refresh(field1)
            print(f"Seeded Field: {field1.field_name} (10.0 Acres)")

        # 8. Seed Allocation
        if batch and field1:
            alloc = db.execute(select(SeedAllocation).where(SeedAllocation.farmer_id == farmer1.id)).scalar_one_or_none()
            if not alloc:
                alloc = SeedAllocation(
                    seed_batch_id=batch.id,
                    farmer_id=farmer1.id,
                    field_id=field1.id,
                    quantity=400.0,
                    unit="KG",
                    allocation_date="2025-10-25",
                    allocated_by=admin.id if admin else None,
                    remarks="Certified foundation seed passbook disbursement"
                )
                db.add(alloc)
                db.commit()
                print("Seeded Seed Allocation: 400 KG to Gurpreet Singh")

        # 9. Crop Cycle
        if field1:
            cycle = db.execute(select(CropCycle).where(CropCycle.farmer_id == farmer1.id)).scalar_one_or_none()
            if not cycle:
                cycle = CropCycle(
                    cycle_code="WHEAT-2025-0001",
                    farmer_id=farmer1.id,
                    field_id=field1.id,
                    crop_type="Wheat",
                    variety="HD-3086 (Pusa Gautami)",
                    season="Rabi 2025-26",
                    sowing_date="2025-11-05",
                    sowing_method="Precision Drill Sowing",
                    allocated_acres=10.0,
                    stage=CropCycleStage.TILLERING,
                    health_status=CropHealthStatus.OPTIMAL,
                    expected_harvest_date="2026-04-10",
                    expected_yield_maunds_per_acre=50.0,
                    target_total_yield_kg=20000.0,
                    ndvi_score=0.86,
                    soil_moisture_pct=42.0,
                    temperature_celsius=22.5,
                    risk_alert_level="NONE",
                    remarks="Healthy vegetative growth stand."
                )
                db.add(cycle)
                db.commit()
                db.refresh(cycle)
                print(f"Seeded Crop Cycle: {cycle.cycle_code} (Stage: {cycle.stage.value})")

                # 10. Field Activities (Kisan Diary)
                act1 = Activity(
                    crop_cycle_id=cycle.id,
                    farmer_id=farmer1.id,
                    field_id=field1.id,
                    activity_type=ActivityType.IRRIGATION,
                    scheduled_date="2025-11-26",
                    executed_date="2025-11-26",
                    status=ActivityStatus.COMPLETED,
                    dosage_or_volume="3 Acre-Inches Canal Water (CRI Stage)",
                    cost=1500.0,
                    logged_by_role="FARMER",
                    logged_by_name=farmer1.name,
                    notes="Crown root irrigation completed on time.",
                    recommendation_adherence=True
                )
                act2 = Activity(
                    crop_cycle_id=cycle.id,
                    farmer_id=farmer1.id,
                    field_id=field1.id,
                    activity_type=ActivityType.FERTILIZER_UREA,
                    scheduled_date="2025-12-10",
                    executed_date="2025-12-10",
                    status=ActivityStatus.COMPLETED,
                    dosage_or_volume="10 Bags Urea (450 KG total)",
                    cost=2700.0,
                    logged_by_role="FARMER",
                    logged_by_name=farmer1.name,
                    notes="Applied split nitrogen after weeding.",
                    recommendation_adherence=True
                )
                db.add_all([act1, act2])
                db.commit()
                print("Seeded Kisan Diary Activities: Irrigation + Urea Top-Dressing")

                # 11. Field Officer Visit
                visit = OfficerVisit(
                    officer_id=officer.id if officer else admin.id,
                    farmer_id=farmer1.id,
                    field_id=field1.id,
                    crop_cycle_id=cycle.id,
                    visit_date="2025-12-15",
                    visit_type=VisitType.ROUTINE_SCOUTING,
                    observed_stage="TILLERING",
                    crop_condition="OPTIMAL",
                    pest_observed="No pest or yellow rust detected",
                    verification_status=VerificationStatus.VERIFIED_COMPLIANT,
                    action_recommended="Proceed with second irrigation around jointing stage.",
                    farmer_signature_obtained=True,
                    gps_lat=30.9015,
                    gps_lng=75.8575
                )
                db.add(visit)
                db.commit()
                print("Seeded Officer Inspection Visit")

        print("\nAll database tables and demo seed data successfully populated in PostgreSQL!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
