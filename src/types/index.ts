export type UserRole = 'SUPER_ADMIN' | 'AGRI_MANAGER' | 'FIELD_OFFICER' | 'FARMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  assignedVillage?: string;
  assignedRegion?: string;
}

export interface Farmer {
  id: string;
  farmerCode: string; // e.g. "FARM-2026-001"
  fullName: string;
  fatherName: string;
  cnicOrId: string;
  mobile: string;
  village: string;
  unionCouncil: string;
  tehsil: string;
  district: string;
  totalLandAcres: number;
  wheatAcreage: number;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FLAGGED' | 'PENDING_VERIFICATION';
  createdDate: string;
  ratingScore?: number; // 1-5 scale based on compliance & yield
  verifiedByOfficerId?: string;
  notes?: string;
}

export type SeedVariety = 'HD-2967' | 'HD-3086' | 'DBW-187' | 'DBW-222' | 'PBW-550' | 'Sharbati C-306' | 'WH-1105' | 'HD-3226';
export type SeedCategory = 'CERTIFIED_STAGE_1' | 'CERTIFIED_STAGE_2' | 'FOUNDATION' | 'BREEDER';

export interface SeedBag {
  id: string;
  bagTagNumber: string; // QR / Barcode string e.g. "SB-2026-98124"
  variety: SeedVariety;
  category: SeedCategory;
  lotNumber: string;
  germinationRate: number; // e.g. 92%
  purityRate: number; // e.g. 98.5%
  moistureContent: number; // e.g. 10.2%
  weightKg: number; // standard 50kg
  baggingDate: string;
  status: 'IN_STOCK' | 'DISPATCHED' | 'DISTRIBUTED' | 'PLANTED' | 'REJECTED';
}

export interface SeedDistributionRecord {
  id: string;
  distributionCode: string; // "DIST-2026-0042"
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  village: string;
  seedVariety: SeedVariety;
  lotNumber: string;
  quantityBags: number;
  totalWeightKg: number;
  allocatedAcres: number;
  subsidyRatePerBag: number; // in currency units
  totalPayable: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT' | 'SUBSIDIZED';
  distributionDate: string;
  officerId: string;
  officerName: string;
  signatureReceived: boolean;
  assignedBagTags: string[];
  fieldParcelId?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface LandParcel {
  id: string;
  parcelCode: string; // "PRCL-LHR-009"
  farmerId: string;
  farmerName: string;
  titleDeedOrKhasraNo: string;
  totalAcreage: number;
  soilType: 'CLAY_LOAM' | 'SANDY_LOAM' | 'SILT_LOAM' | 'ALLUVIAL' | 'SALINE';
  irrigationSource: 'CANAL' | 'TUBEWELL' | 'RAIN_FED' | 'SOLAR_PUMP' | 'CANAL_PLUS_TUBEWELL';
  phLevel: number;
  organicMatterPct: number;
  village: string;
  centerCoordinates: GeoPoint;
  polygonBoundary: GeoPoint[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedDate?: string;
  verifiedBy?: string;
}

export type CropCycleStage = 
  | 'LAND_PREPARATION'
  | 'SOWING'
  | 'CROWN_ROOT_INITIATION'
  | 'TILLERING'
  | 'JOINTING'
  | 'BOOTING'
  | 'HEADING_FLOWERING'
  | 'MILK_STAGE'
  | 'DOUGH_STAGE'
  | 'MATURITY_RIPENING'
  | 'HARVESTED';

export type CropHealthStatus = 'OPTIMAL' | 'GOOD' | 'STRESSED' | 'DISEASED' | 'CRITICAL';

export interface CropCycle {
  id: string;
  cycleCode: string; // "WHEAT-2025-2026-F012"
  season: 'RABI_2025_2026' | 'RABI_2026_2027';
  farmerId: string;
  farmerName: string;
  fieldParcelId: string;
  parcelCode: string;
  seedVariety: SeedVariety;
  sowingDate: string;
  sowingMethod: 'BROADCASTING' | 'DRILL_SOWING' | 'ZERO_TILLAGE' | 'BED_PLANTING';
  allocatedAcres: number;
  currentStage: CropCycleStage;
  healthStatus: CropHealthStatus;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  expectedYieldMaundsPerAcre: number;
  targetTotalYieldKg: number;
  actualTotalYieldKg?: number;
  ndviScore: number; // 0.0 - 1.0 satellite vegetation index
  soilMoisturePct: number;
  temperatureCelsius: number;
  riskAlertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
  lastInspectionDate: string;
}

export type ActivityType = 
  | 'IRRIGATION'
  | 'FERTILIZER_UREA'
  | 'FERTILIZER_DAP'
  | 'FERTILIZER_POTASH'
  | 'PESTICIDE_SPRAY'
  | 'WEEDICIDE_SPRAY'
  | 'FIELD_VISIT_INSPECTION'
  | 'SOIL_TEST'
  | 'NDVI_ASSESSMENT';

export interface FieldActivity {
  id: string;
  cropCycleId: string;
  farmerId: string;
  farmerName: string;
  fieldParcelId: string;
  activityType: ActivityType;
  scheduledDate: string;
  executedDate?: string;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  dosageOrVolume?: string; // e.g. "1 Bag (50kg) Urea"
  cost: number;
  loggedByRole: UserRole;
  loggedByName: string;
  notes?: string;
  photoUrl?: string;
  recommendationAdherence: boolean;
}

export interface HarvestRecord {
  id: string;
  harvestCode: string; // "HRV-2026-088"
  cropCycleId: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  fieldParcelId: string;
  harvestDate: string;
  harvestMethod: 'MANUAL_COMBINE' | 'MECHANICAL_HARVESTER' | 'REAPER';
  totalAcreageHarvested: number;
  totalBagsCollected: number;
  totalWeightMaunds: number; // 1 Maund = 40 kg
  totalWeightKg: number;
  yieldPerAcreMaunds: number;
  grainMoisturePct: number; // target < 12%
  grainQualityGrade: 'GRADE_A_PREMIUM' | 'GRADE_B_STANDARD' | 'GRADE_C_FEED' | 'REJECTED';
  dockagePercentage: number;
  procurementCenterAssigned: string;
  officerVerified: boolean;
  status: 'PENDING_DELIVERY' | 'DELIVERED_TO_MILL' | 'INSPECTED' | 'STORED_IN_SILO';
}

export interface MillingBatch {
  id: string;
  batchNumber: string; // "MIL-BATCH-2026-104"
  receivedDate: string;
  sourceFarmerIds: string[];
  totalInputWheatKg: number;
  flourYieldKg: number;
  branYieldKg: number;
  fineAttaYieldKg: number;
  semolinaSujiYieldKg: number;
  extractionRatePct: number; // target ~ 76-80%
  qualityTestScore: number; // Gluten / protein index
  processedDate: string;
  storageSiloId: string;
  batchStatus: 'QUEUED' | 'IN_PROCESSING' | 'COMPLETED' | 'QUALITY_HOLD';
  supervisorName: string;
}

export interface AgriAlert {
  id: string;
  type: 'RUST_DISEASE_WARNING' | 'WEATHER_HAIL_RAIN' | 'IRRIGATION_DELAY' | 'FERTILIZER_OVERDUE' | 'QUALITY_DEVIATION' | 'SUPPLY_SHORTAGE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  region: string;
  affectedFarmersCount: number;
  createdDate: string;
  resolved: boolean;
  actionRequired: string;
}

export interface AdvisoryBulletin {
  id: string;
  title: string;
  category: 'CROP_PROTECTION' | 'IRRIGATION' | 'FERTILIZER' | 'MARKET_PRICE' | 'WEATHER';
  hindiTitle?: string;
  description: string;
  hindiDescription?: string;
  recommendedAction: string;
  targetVariety?: SeedVariety;
  publishedDate: string;
  author: string;
  iconName: string;
}

export interface WeatherDay {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain Showers' | 'Windy' | 'Thunderstorm';
  rainChancePct: number;
  humidityPct: number;
  windSpeedKmh: number;
  farmingAdvice: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}
