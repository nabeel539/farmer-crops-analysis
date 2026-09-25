"""Seed script to initialize PostgreSQL database with tables and demo records."""
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
from app.models.crop_cycle import CropCycle
from app.models.activity import Activity
from app.models.visit import OfficerVisit
from app.models.harvest import HarvestRecord

def init_db():
    print("Creating all tables in PostgreSQL 'krishi_agritech'...")
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
            print("Seeded Admin: admin@krishi.com (password: admin1234)")

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
            print("Seeded Field Officer: officer@krishi.com (password: officer1234)")

        # 3. Farmer User
        farmer_user = db.execute(select(User).where(User.email == "ramesh@krishi.com")).scalar_one_or_none()
        if not farmer_user:
            farmer_user = User(
                email="ramesh@krishi.com",
                name="Ramesh Patel",
                password_hash=hash_password("farmer1234"),
                role=UserRole.FARMER,
                is_active=True
            )
            db.add(farmer_user)
            print("Seeded Farmer User: ramesh@krishi.com (password: farmer1234)")

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
            supply = SeedSupply(
                vendor_id=vendor.id,
                crop="Wheat",
                variety="HD-3086 (Pusa Gautami)",
                supply_date="2026-10-15",
                purchase_reference="PO-2026-0089",
                remarks="Certified high-germination foundation wheat batch"
            )
            db.add(supply)
            db.commit()
            db.refresh(supply)

            batch = SeedBatch(
                supply_id=supply.id,
                batch_number="BATCH-2026-HD3086-01",
                quantity=1000.0,
                unit="KG",
                received_quantity=1000.0,
                allocated_quantity=0.0,
                available_quantity=1000.0
            )
            db.add(batch)
            db.commit()
            print(f"Seeded Seed Supply & Batch: {batch.batch_number} (1000 KG)")

        # 6. Farmer & Field
        farmer = db.execute(select(Farmer).where(Farmer.mobile_number == "9812345678")).scalar_one_or_none()
        if not farmer:
            farmer = Farmer(
                name="Ramesh Patel",
                mobile_number="9812345678",
                address="Near Main Canal, Rampur",
                village="Rampur",
                block="Nilokheri",
                district="Karnal",
                state="Haryana",
                status=FarmerStatus.ACTIVE,
                registration_date="2026-01-10"
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            print(f"Seeded Farmer Profile: {farmer.name} ({farmer.village}, {farmer.district})")

            field = Field(
                farmer_id=farmer.id,
                field_name="North Canal Parcel - Plot A",
                village="Rampur",
                block="Nilokheri",
                district="Karnal",
                area=5.0,
                crop="Wheat",
                season="Rabi 2026-27",
                status=FieldStatus.ACTIVE,
                latitude=29.6857,
                longitude=76.9905,
                polygon={
                    "type": "Polygon",
                    "coordinates": [[
                        [76.9901, 29.6852],
                        [76.9915, 29.6854],
                        [76.9912, 29.6868],
                        [76.9898, 29.6865],
                        [76.9901, 29.6852]
                    ]]
                },
                polygon_color=PolygonColor.GREEN,
                notes="Primary irrigated wheat field with high soil moisture"
            )
            db.add(field)
            db.commit()
            print(f"Seeded Field: {field.field_name} (5.0 Acres with GeoJSON polygon)")

        print("\nAll database tables and seed data populated successfully in PostgreSQL!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
