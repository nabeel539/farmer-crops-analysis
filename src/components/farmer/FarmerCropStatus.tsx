'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CropCycleRecord } from '@/store/api/cropCycleApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  Sprout,
  Calendar,
  Layers,
  Thermometer,
  Droplets,
  Activity,
  Wheat,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Check,
  Zap,
  FlaskConical,
  Tractor,
  Globe2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface FarmerCropStatusProps {
  farmer: Farmer;
  cropCycles: CropCycleRecord[];
  isLoading: boolean;
  onNavigateToDiary?: () => void;
}

export interface LifecycleStep {
  step: number;
  stageKey: string;
  stageNameEn: string;
  stageNameHi: string;
  dayRange: string;
  minDay: number;
  maxDay: number;
  category: 'SOWING' | 'IRRIGATION' | 'FERTILIZER' | 'PROTECTION' | 'HARVEST';
  categoryLabelEn: string;
  categoryLabelHi: string;
  summaryEn: string;
  summaryHi: string;
  detailsEn: string;
  detailsHi: string;
  recommendedInputsEn: string;
  recommendedInputsHi: string;
  criticalWarningEn?: string;
  criticalWarningHi?: string;
  iconType: 'sprout' | 'droplet' | 'flask' | 'shield' | 'tractor';
}

export const WHEAT_LIFECYCLE_ROADMAP: LifecycleStep[] = [
  {
    step: 1,
    stageKey: 'SOWING',
    stageNameEn: 'Sowing & Basal Fertilizer Application',
    stageNameHi: 'खेत तैयारी, बीजोपचार व बुवाई',
    dayRange: 'Day 0 – 5',
    minDay: 0,
    maxDay: 5,
    category: 'SOWING',
    categoryLabelEn: 'Sowing & Nutrition',
    categoryLabelHi: 'बुवाई एवं पोषण',
    summaryEn: 'Precision seed drilling, seed treatment, and basal fertilizer application.',
    summaryHi: 'सीड ड्रिल से बुवाई, बीजोपचार और बेसल खाद डालना।',
    detailsEn: 'Prepare a fine tilth seedbed. Sow certified wheat seeds at 4-5 cm depth with 40-45 kg/acre seed rate.',
    detailsHi: 'खेत को भुरभुरा बनाकर 4-5 सेमी की गहराई पर 40-45 किग्रा/एकड़ बीज की बुवाई करें।',
    recommendedInputsEn: 'DAP: 50 kg/acre + MOP (Potash): 20 kg/acre + Zinc Sulphate 33%: 5 kg/acre. Seed Treatment: Tebuconazole 2 DS @ 2g/kg seed.',
    recommendedInputsHi: 'DAP: 50 kg/एकड़ + MOP (पोटाश): 20 kg/एकड़ + जिंक सल्फेट 33%: 5 kg/एकड़। बीजोपचार: Tebuconazole @ 2g/kg बीज।',
    criticalWarningEn: 'Apply 100% of Phosphorus (DAP) at sowing time as basal dose; top-dressing later is far less effective.',
    criticalWarningHi: 'फॉस्फोरस (DAP) का 100% कोटा बुवाई के समय ही जमीन में दें, बाद में देने पर असर नहीं होता।',
    iconType: 'sprout',
  },
  {
    step: 2,
    stageKey: 'CRI_STAGE',
    stageNameEn: 'Crown Root Initiation (1st Critical Irrigation)',
    stageNameHi: 'पहला पानी - CRI ताज जड़ अवस्था',
    dayRange: 'Day 20 – 25',
    minDay: 20,
    maxDay: 25,
    category: 'IRRIGATION',
    categoryLabelEn: '1st Critical Irrigation',
    categoryLabelHi: 'पहली सिंचाई (अति-महत्वपूर्ण)',
    summaryEn: 'Crown Root Initiation (Day 21) is the single most critical irrigation stage in wheat.',
    summaryHi: 'ताज जड़ें (Crown Roots) निकलने पर पहली और सबसे महत्वपूर्ण सिंचाई।',
    detailsEn: 'Crown roots develop directly beneath the soil surface to anchor the plant and nourish tillers.',
    detailsHi: 'गेहूं की फसल में यह पानी सबसे आवश्यक है। इस समय पौधे की मुख्य सहायक जड़ें जमीन में फैलती हैं।',
    recommendedInputsEn: '1st Light Irrigation (Depth: 5-6 cm). Ensure good drainage and avoid water stagnation.',
    recommendedInputsHi: 'हल्की सिंचाई (First Irrigation)। खेत में कहीं भी पानी का भराव न होने दें।',
    criticalWarningEn: 'Delaying this irrigation by even 5-7 days reduces tillering by 30% and significantly cuts grain yield.',
    criticalWarningHi: 'इस सिंचाई में 5-7 दिन की भी देरी से कल्ले कम फूटते हैं और 20-30% पैदावार घट जाती है।',
    iconType: 'droplet',
  },
  {
    step: 3,
    stageKey: 'TILLERING_WEED',
    stageNameEn: '1st Nitrogen Top-Dressing & Weed Management',
    stageNameHi: 'पहली यूरिया टॉप-ड्रेसिंग व खरपतवार स्प्रे',
    dayRange: 'Day 30 – 35',
    minDay: 30,
    maxDay: 35,
    category: 'FERTILIZER',
    categoryLabelEn: 'Fertilizer & Weed Management',
    categoryLabelHi: 'उर्वरक एवं खरपतवार नियंत्रण',
    summaryEn: 'First split application of Urea nitrogen and post-emergence weed control.',
    summaryHi: 'पहले पानी के बाद यूरिया छिड़काव और खरपतवार नाशक का प्रयोग।',
    detailsEn: 'Apply Urea 6-8 days after first irrigation when soil is in workable condition (wapsa condition). Follow with herbicide.',
    detailsHi: 'जब मिट्टी में ओट आ जाए (पैर न धंसे), तब यूरिया डालें और 2-3 दिन बाद खरपतवार नाशक का स्प्रे करें।',
    recommendedInputsEn: 'Urea: 45 kg (1 bag/acre). Broadleaf weeds: 2,4-D (500g/acre); Grassy/Phalaris minor: Clodinafop 15 WP (160g/acre).',
    recommendedInputsHi: 'यूरिया: 45 kg (1 बैग/एकड़)। चौड़ी पत्ती हेतु 2,4-D (500g/एकड़) या मंडूसी/गुल्ली डंडा हेतु Clodinafop 15 WP (160g/एकड़)।',
    criticalWarningEn: 'Spray herbicides using a flat-fan nozzle in 150 liters of clean water on a bright sunny day.',
    criticalWarningHi: 'खरपतवार नाशक का स्प्रे तेज धूप में फ्लैट-फैन नोजल से 150 लीटर पानी में मिलाकर करें।',
    iconType: 'flask',
  },
  {
    step: 4,
    stageKey: 'TILLERING',
    stageNameEn: 'Tillering Stage (2nd Irrigation)',
    stageNameHi: 'दूसरा पानी एवं कल्ले फूटना',
    dayRange: 'Day 40 – 45',
    minDay: 40,
    maxDay: 45,
    category: 'IRRIGATION',
    categoryLabelEn: '2nd Irrigation',
    categoryLabelHi: 'दूसरी सिंचाई',
    summaryEn: 'Vegetative tiller branching and foliar micronutrient supplementation.',
    summaryHi: 'कल्ले फूटने के समय दूसरी सिंचाई और सूक्ष्म पोषक तत्वों का छिड़काव।',
    detailsEn: 'Adequate soil moisture is mandatory to ensure 5-7 robust productive tillers per wheat seedling.',
    detailsHi: 'प्रति पौधा 5-7 मजबूत कल्ले (Tillers) बनने के लिए जमीन में पर्याप्त नमी होना अनिवार्य है।',
    recommendedInputsEn: '2nd Irrigation + Foliar spray of 0.5% Zinc Sulphate + 2% Urea if interveinal yellowing appears on leaves.',
    recommendedInputsHi: 'दूसरी सिंचाई (2nd Irrigation)। यदि पत्तियों पर पीलापन हो तो Zinc Sulphate 0.5% + 2% Urea का पर्णीय स्प्रे करें।',
    criticalWarningEn: 'Prevent drought stress; weak tillers result in fewer, smaller earheads.',
    criticalWarningHi: 'इस अवस्था में सूखे का तनाव न आने दें, कल्ले कमजोर रहने से बालियां छोटी रह जाती हैं।',
    iconType: 'droplet',
  },
  {
    step: 5,
    stageKey: 'JOINTING',
    stageNameEn: 'Stem Extension & 2nd Urea Split (Jointing)',
    stageNameHi: 'तीसरा पानी, तने में गांठ बनना व अंतिम यूरिया',
    dayRange: 'Day 60 – 65',
    minDay: 60,
    maxDay: 65,
    category: 'FERTILIZER',
    categoryLabelEn: '3rd Irrigation & Final Urea',
    categoryLabelHi: 'तीसरी सिंचाई एवं अंतिम खाद',
    summaryEn: 'Rapid stem elongation and earhead formation inside the leaf sheath.',
    summaryHi: 'तने में गांठ बनते समय तीसरी सिंचाई और यूरिया की अंतिम खुराक।',
    detailsEn: 'Apply the remaining quota of nitrogen before the boot leaf develops to maximize grain spikelet count.',
    detailsHi: 'पौधे की लंबाई तेजी से बढ़ती है और अंदर बालियों का निर्माण (Earhead Primordia) शुरू हो जाता है।',
    recommendedInputsEn: '3rd Irrigation + Urea: 45 kg (1 bag/acre) - Final nitrogen split.',
    recommendedInputsHi: 'तीसरी सिंचाई (3rd Irrigation) + यूरिया: 45 kg (1 बैग/एकड़) - यूरिया का अंतिम कोटा।',
    criticalWarningEn: 'Never apply Urea after heading/flowering, as excess nitrogen delays maturity and invites rust infection.',
    criticalWarningHi: 'बाली निकलने के बाद कभी भी यूरिया न डालें; इससे फंगस और पीला रतुआ का प्रकोप बढ़ता है।',
    iconType: 'flask',
  },
  {
    step: 6,
    stageKey: 'BOOTING_HEADING',
    stageNameEn: 'Booting to Flowering (4th Irrigation & Rust Scouting)',
    stageNameHi: 'चौथा पानी, बाली निकलना व पीला रतुआ जांच',
    dayRange: 'Day 80 – 85',
    minDay: 80,
    maxDay: 85,
    category: 'PROTECTION',
    categoryLabelEn: '4th Irrigation & Crop Protection',
    categoryLabelHi: 'चौथी सिंचाई व रोग सुरक्षा',
    summaryEn: 'Earhead emergence, anthesis (flowering), and Yellow Rust fungicide scouting.',
    summaryHi: 'बाली पूर्ण रूप से बाहर निकलने पर चौथी सिंचाई और फफूंदनाशक स्प्रे।',
    detailsEn: 'Inspect lower and middle leaves for linear yellow powdery pustules (Puccinia striiformis).',
    detailsHi: 'निचली पत्तियों पर पीले रंग की धारियां/पाउडर (Yellow Rust) की नियमित जांच करें।',
    recommendedInputsEn: '4th Irrigation. Prophylactic fungicide: Propiconazole 25 EC (Tilt) @ 200 ml/acre in 200 L water if rust is detected.',
    recommendedInputsHi: 'चौथी सिंचाई (4th Irrigation)। पीला रतुआ दिखे तो Propiconazole 25 EC (टिल्ट) @ 200ml/एकड़ 200 लीटर पानी में।',
    criticalWarningEn: 'Do not irrigate during high winds or turbulent weather to prevent crop lodging (falling over).',
    criticalWarningHi: 'तेज पछुआ हवा के समय पानी न लगाएं, वरना पूरी फसल जमीन पर गिर (Lodging) सकती है।',
    iconType: 'shield',
  },
  {
    step: 7,
    stageKey: 'MILK_STAGE',
    stageNameEn: 'Milky Grain Formation (5th Irrigation)',
    stageNameHi: 'पांचवां पानी एवं दुधिया दाना अवस्था',
    dayRange: 'Day 100 – 105',
    minDay: 100,
    maxDay: 105,
    category: 'IRRIGATION',
    categoryLabelEn: '5th Irrigation (Grain Filling)',
    categoryLabelHi: 'पांचवी सिंचाई (अनाज भराव)',
    summaryEn: 'Kernel filling period when grain contains milky liquid starch.',
    summaryHi: 'दाने में दूध भरते समय पांचवी हल्की सिंचाई।',
    detailsEn: 'Maintain light soil moisture to guard against terminal heat stress and grain shriveling.',
    detailsHi: 'तापमान बढ़ने पर दाना सिकुड़ने से बचाने और मोटे दाने के निर्माण हेतु हल्की नमी आवश्यक है।',
    recommendedInputsEn: '5th Light Irrigation + Foliar spray of NPK 0:0:50 (Potassium Sulphate) @ 1 kg/acre for bold, heavier grains.',
    recommendedInputsHi: 'पांचवी हल्की सिंचाई (5th Light Irrigation) + NPK 0:0:50 (पोटाश) 1 kg/एकड़ का पर्णीय स्प्रे (चमक व वजन बढ़ाने हेतु)।',
    criticalWarningEn: 'Terminal heat stress during milk stage can shrivel grains; keep microclimate cool with light watering.',
    criticalWarningHi: 'इस समय तापमान वृद्धि (Terminal Heat) से दाना सूख सकता है; हल्की सिंचाई से खेत ठंडा रखें।',
    iconType: 'droplet',
  },
  {
    step: 8,
    stageKey: 'DOUGH_STAGE',
    stageNameEn: 'Dough Stage (Final Light Irrigation)',
    stageNameHi: 'छठा अंतिम पानी व दाना सख्त होना',
    dayRange: 'Day 115 – 120',
    minDay: 115,
    maxDay: 120,
    category: 'IRRIGATION',
    categoryLabelEn: 'Final Light Irrigation',
    categoryLabelHi: 'अंतिम हल्की सिंचाई',
    summaryEn: 'Grain hardens from soft dough to hard dough; foliage turns golden yellow.',
    summaryHi: 'दाना सख्त होते समय अंतिम हल्की सिंचाई।',
    detailsEn: 'Provide a final light irrigation only if soil is light sandy or moisture is severely depleted.',
    detailsHi: 'फसल का रंग हल्के पीले से सुनहरे में बदलता है। यदि मिट्टी रेतीली हो तो ही हल्की सिंचाई करें।',
    recommendedInputsEn: 'Final Light Irrigation (if necessary). Terminate all watering 15-20 days prior to harvest.',
    recommendedInputsHi: 'अंतिम हल्की सिंचाई (Final Light Irrigation)।',
    criticalWarningEn: 'Stop irrigation completely 15-20 days before harvest to allow soil to dry for heavy combine machinery.',
    criticalWarningHi: 'कटाई से 15-20 दिन पहले पानी पूरी तरह बंद कर दें ताकि मिट्टी सूख जाए और कंबाइन चल सके।',
    iconType: 'droplet',
  },
  {
    step: 9,
    stageKey: 'HARVESTED',
    stageNameEn: 'Maturity, Harvesting & Threshing',
    stageNameHi: 'पूर्ण परिपक्वता, कटाई, मड़ाई व भंडारण',
    dayRange: 'Day 135 – 150',
    minDay: 135,
    maxDay: 150,
    category: 'HARVEST',
    categoryLabelEn: 'Harvest & Safe Storage',
    categoryLabelHi: 'कटाई एवं भंडारण',
    summaryEn: 'Combine harvesting at physiological maturity and safe grain storage.',
    summaryHi: 'फसल पकने पर कंबाइन हार्वेस्टर से कटाई एवं सुरक्षित भंडारण।',
    detailsEn: 'Harvest when straw turns golden brown and grain cracks crisply between teeth under pressure.',
    detailsHi: 'जब बालियां सुनहरी भूरी हो जाएं और दाना दांत से दबाने पर कड़क आवाज के साथ टूटे, तब कटाई करें।',
    recommendedInputsEn: 'Combine Harvester / Reaper Binder + Clean, dry storage bags.',
    recommendedInputsHi: 'कंबाइन हार्वेस्टर / रीपर थ्रेशर + सुरक्षित बोरियां व गोदाम।',
    criticalWarningEn: 'Ensure grain moisture is below 12% before storage to prevent mold, weevils, and spoilage.',
    criticalWarningHi: 'भंडारण के समय दाने में नमी 12% से कम होनी चाहिए ताकि फफूंद और कीट न लगें।',
    iconType: 'tractor',
  },
];

const PHENOLOGY_STAGES = [
  { key: 'SOWING', label: 'Sowing', days: 'Day 0' },
  { key: 'GERMINATION', label: 'Germination', days: 'Day 5-7' },
  { key: 'CRI_STAGE', label: 'CRI Stage (1st Water)', days: 'Day 21' },
  { key: 'TILLERING', label: 'Tillering', days: 'Day 35-45' },
  { key: 'JOINTING', label: 'Stem Extension', days: 'Day 60' },
  { key: 'BOOTING', label: 'Booting', days: 'Day 75' },
  { key: 'HEADING_FLOWERING', label: 'Flowering', days: 'Day 85-95' },
  { key: 'MILK_STAGE', label: 'Milky Grain', days: 'Day 105' },
  { key: 'DOUGH_STAGE', label: 'Dough Stage', days: 'Day 120' },
  { key: 'PHYSIOLOGICAL_MATURITY', label: 'Maturity', days: 'Day 135' },
  { key: 'HARVESTED', label: 'Harvested', days: 'Day 145+' },
];

export function FarmerCropStatus({
  farmer,
  cropCycles,
  isLoading,
  onNavigateToDiary,
}: FarmerCropStatusProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const activeCycle = cropCycles[0];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!activeCycle) {
    return (
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">No Active Crop Cycle Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There is currently no wheat crop cycle initiated for {farmer.name}. Contact your Agri-Officer or Administrator to register your seasonal sowing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sowingDate = activeCycle.sowing_date ? new Date(activeCycle.sowing_date) : new Date();
  const daysSinceSowing = Math.max(0, differenceInDays(new Date(), sowingDate));
  const expectedHarvestDate = activeCycle.expected_harvest_date ? new Date(activeCycle.expected_harvest_date) : null;
  const daysToHarvest = expectedHarvestDate ? Math.max(0, differenceInDays(expectedHarvestDate, new Date())) : null;

  const currentStageIndex = PHENOLOGY_STAGES.findIndex((s) => s.key === activeCycle.stage);
  const stageProgressPct = Math.min(
    100,
    Math.max(10, Math.round(((Math.max(0, currentStageIndex) + 1) / PHENOLOGY_STAGES.length) * 100))
  );

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'OPTIMAL':
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Optimal Health</Badge>;
      case 'MILD_STRESS':
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Mild Stress (Water / Nutrient)</Badge>;
      case 'SEVERE_STRESS':
        return <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30">Severe Stress</Badge>;
      case 'DISEASE_DETECTED':
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">Rust / Pest Alert</Badge>;
      default:
        return <Badge variant="outline">{health}</Badge>;
    }
  };

  const getStageRecommendation = (stage: string) => {
    switch (stage) {
      case 'SOWING':
      case 'GERMINATION':
        return {
          title: 'Early Stand Establishment',
          desc: 'Ensure optimal seed-to-soil contact. Watch for crust formation if unexpected light showers occur.',
          action: 'Check Seedling Emergence',
        };
      case 'CRI_STAGE':
        return {
          title: 'Critical 1st Irrigation (CRI Stage)',
          desc: 'Crown Root Initiation (Day 21) is the most critical irrigation stage. Delay can reduce tillering by 30%.',
          action: 'Log 1st Irrigation in Kisan Diary',
        };
      case 'TILLERING':
        return {
          title: '1st Split Nitrogen Top-Dressing',
          desc: 'Apply 1 bag Urea per acre after first irrigation when soil allows walking. Apply Weedicide if broadleaf weeds appear.',
          action: 'Log Urea Application',
        };
      case 'JOINTING':
        return {
          title: 'Stem Elongation & 2nd Irrigation',
          desc: 'Second irrigation required. Scout lower leaves for Yellow Rust (Puccinia striiformis) pustules.',
          action: 'Inspect Lower Leaves for Rust',
        };
      case 'BOOTING':
      case 'HEADING_FLOWERING':
        return {
          title: 'Flowering & Anthesis Protection',
          desc: 'Critical water-sensitive stage. Avoid water logging. Prophylactic fungicide spray (Propiconazole 25 EC @ 200ml/acre) recommended if temperature is 18-24°C with fog.',
          action: 'Fungicide Spray Advisory',
        };
      case 'MILK_STAGE':
      case 'DOUGH_STAGE':
        return {
          title: 'Grain Filling Period',
          desc: 'Terminal heat stress monitoring. Ensure adequate soil moisture to prevent premature grain shriveling.',
          action: 'Check Grain Plumpness',
        };
      case 'PHYSIOLOGICAL_MATURITY':
      case 'HARVESTED':
        return {
          title: 'Pre-Harvest & Grain Moisture',
          desc: 'Stop irrigation. Prepare combine harvester. Harvest when grain moisture drops below 12-14%.',
          action: 'Coordinate Harvest Intake',
        };
      default:
        return {
          title: 'Routine Agronomic Scouting',
          desc: 'Follow standard agricultural package of practices recommended by PAU/ICAR.',
          action: 'Log Daily Activity',
        };
    }
  };

  const recommendation = getStageRecommendation(activeCycle.stage);

  const filteredLifecycleSteps = WHEAT_LIFECYCLE_ROADMAP.filter((st) => {
    if (filterCategory === 'ALL') return true;
    return st.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Active Crop Cycle */}
      <Card className="overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-background to-emerald-500/5 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg font-bold">
                    {activeCycle.crop_type} ({activeCycle.variety})
                  </CardTitle>
                  <Badge variant="outline" className="font-mono text-xs bg-background">
                    {activeCycle.cycle_code}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Season: {activeCycle.season} &bull; Sown: {activeCycle.sowing_date ? format(sowingDate, 'dd MMM yyyy') : 'N/A'} &bull; {activeCycle.allocated_acres} Acres
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getHealthBadge(activeCycle.health_status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          {/* Days Elapsed & Countdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-background border border-border/80 flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Days Sown (Since Planting)</div>
                <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">{daysSinceSowing} Days</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border/80 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Harvest Countdown</div>
                <div className="text-lg font-bold font-mono">
                  {daysToHarvest !== null ? `${daysToHarvest} Days Left` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border/80 col-span-2 sm:col-span-1 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Target Yield</div>
                <div className="text-lg font-bold font-mono">
                  {activeCycle.target_total_yield_kg ? `${(activeCycle.target_total_yield_kg / 1000).toFixed(1)} MT` : `${activeCycle.expected_yield_maunds_per_acre} Mnds/Ac`}
                </div>
              </div>
            </div>
          </div>

          {/* 11-Stage Phenology Progress Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                Current Phenology Stage: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeCycle.stage.replace(/_/g, ' ')}</span>
              </span>
              <span className="font-mono text-muted-foreground font-semibold">{stageProgressPct}% Complete</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden border border-border/60">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stageProgressPct}%` }}
              />
            </div>

            {/* Stage markers slider / chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
              {PHENOLOGY_STAGES.slice(0, 6).map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={stage.key}
                    className={`p-2 rounded-md text-[11px] border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-muted/40 text-muted-foreground border-border/50 opacity-60'
                    }`}
                  >
                    <div className="truncate">{stage.label}</div>
                    <div className="text-[9px] opacity-80">{stage.days}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Field Telemetry & Agro-climatic Sensors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Soil Moisture</div>
                <div className="text-sm font-bold font-mono">{activeCycle.soil_moisture_pct}% (Adequate)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ambient Temp</div>
                <div className="text-sm font-bold font-mono">{activeCycle.temperature_celsius}°C (Favorable)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Canopy NDVI</div>
                <div className="text-sm font-bold font-mono">{activeCycle.ndvi_score} (High Vigour)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Sowing Method</div>
                <div className="text-sm font-bold truncate">{activeCycle.sowing_method || 'Precision Drill'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurable Farmer Advisory & Tailored Farm Strategy Card */}
      <Card className="border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>{language === 'EN' ? 'Agri-Officer Configured Cultivation Strategy' : 'कृषि अधिकारी द्वारा निर्धारित खेती योजना'}</span>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">Active POP Plan</Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {language === 'EN' ? 'Tailored specifically for this crop cycle, variety, and soil conditions.' : 'इस किस्म, खेत की मिट्टी और फसल चक्र के लिए विशेष दिशा-निर्देश।'}
                </p>
              </div>
            </div>
          </div>

          {/* Advisory Note Highlight */}
          {(activeCycle.officer_advisory || activeCycle.remarks) && (
            <div className="p-3.5 rounded-xl bg-background/80 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-foreground">
                  {language === 'EN' ? 'Special Field Officer Advisory for You:' : 'आपके लिए कृषि अधिकारी का विशेष परामर्श:'}
                </span>
                <p className="text-muted-foreground italic font-medium leading-relaxed">
                  &ldquo;{activeCycle.officer_advisory || activeCycle.remarks}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Configured Strategy Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-background border flex items-center gap-2.5">
              <Droplets className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {language === 'EN' ? 'Irrigation Strategy' : 'सिंचाई योजना'}
                </div>
                <div className="font-bold text-foreground truncate">
                  {activeCycle.irrigation_strategy === 'DRIP_PRECISION'
                    ? (language === 'EN' ? 'Drip Precision Mode' : 'ड्रिप सूक्ष्म सिंचाई')
                    : activeCycle.irrigation_strategy === 'TUBEWELL_FREQUENT'
                    ? (language === 'EN' ? 'Tubewell Light Waterings' : 'ट्यूबवेल बार-बार सिंचाई')
                    : activeCycle.irrigation_strategy === 'RAINFED_CONSERVATION'
                    ? (language === 'EN' ? 'Rainfed Conservation' : 'बारानी संरक्षित नमी')
                    : (language === 'EN' ? 'Standard 6-Stage Canal & Tubewell' : 'मानक 6-चरणीय सिंचाई')}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-background border flex items-center gap-2.5">
              <FlaskConical className="h-4 w-4 text-purple-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {language === 'EN' ? 'Nutrition / Fertilizer Plan' : 'उर्वरक एवं पोषण योजना'}
                </div>
                <div className="font-bold text-foreground truncate">
                  {activeCycle.nutrition_plan === 'HIGH_YIELD_SPLIT'
                    ? (language === 'EN' ? 'High-Yield (NPK + Zn + Potash)' : 'सघन पोषण NPK+जिंक+पोटाश')
                    : activeCycle.nutrition_plan === 'ORGANIC_BIO'
                    ? (language === 'EN' ? 'Bio-Fertilizer (FYM + PSB)' : 'जैविक (गोबर खाद + PSB)')
                    : activeCycle.nutrition_plan === 'CUSTOM'
                    ? (language === 'EN' ? 'Custom Soil Tested Plan' : 'मृदा परीक्षण आधारित खुराक')
                    : (language === 'EN' ? 'Standard PAU/IARI (DAP + Urea + Zn)' : 'मानक DAP + यूरिया + जिंक')}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-background border flex items-center gap-2.5">
              <Sprout className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {language === 'EN' ? 'Seed Treatment' : 'बीजोपचार'}
                </div>
                <div className="font-bold text-foreground truncate">
                  {activeCycle.seed_treatment || 'Tebuconazole 2 DS @ 2g/kg'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COMPREHENSIVE CROP LIFECYCLE & ACTION ROADMAP */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Sprout className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>
                      {language === 'EN'
                        ? 'Wheat Crop Lifecycle & Package of Practices (POP) Roadmap'
                        : 'गेहूं फसल का पूरा जीवन चक्र एवं कार्य सारणी'}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {language === 'EN'
                      ? 'Chronological day-by-day roadmap from sowing to harvest with recommended inputs, water schedules & protection.'
                      : 'बुवाई से कटाई तक किस दिन के बाद क्या कार्य करना है, खाद-पानी की सही मात्रा और समय-सारणी।'}
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Language Toggle + Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Language Switcher Button */}
              <div className="flex items-center bg-background border border-border/80 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLanguage('EN')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'EN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('HI')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'HI'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  {
                    id: 'ALL',
                    labelEn: 'All 9 Stages',
                    labelHi: 'सभी 9 चरण',
                  },
                  {
                    id: 'IRRIGATION',
                    labelEn: '💧 6 Irrigations',
                    labelHi: '💧 6 सिंचाई',
                  },
                  {
                    id: 'FERTILIZER',
                    labelEn: '🌾 Fertilizers',
                    labelHi: '🌾 खाद/यूरिया',
                  },
                  {
                    id: 'PROTECTION',
                    labelEn: '🛡️ Plant Protection',
                    labelHi: '🛡️ रोग सुरक्षा',
                  },
                  {
                    id: 'HARVEST',
                    labelEn: '🚜 Harvest',
                    labelHi: '🚜 कटाई',
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterCategory(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterCategory === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {language === 'EN' ? tab.labelEn : tab.labelHi}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-4">
            {filteredLifecycleSteps.map((step) => {
              const isCurrent = daysSinceSowing >= step.minDay && daysSinceSowing <= step.maxDay;
              const isCompleted = daysSinceSowing > step.maxDay;
              const isUpcoming = daysSinceSowing < step.minDay;
              const daysRemaining = step.minDay - daysSinceSowing;

              const stageTitle = language === 'EN' ? step.stageNameEn : step.stageNameHi;
              const stageSub = language === 'EN' ? step.stageNameHi : step.stageNameEn;
              const summary = language === 'EN' ? step.summaryEn : step.summaryHi;
              const details = language === 'EN' ? step.detailsEn : step.detailsHi;
              const inputs = language === 'EN' ? step.recommendedInputsEn : step.recommendedInputsHi;
              const warning = language === 'EN' ? step.criticalWarningEn : step.criticalWarningHi;

              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30 shadow-md'
                      : isCompleted
                      ? 'border-border/70 bg-card hover:bg-muted/20 opacity-90'
                      : 'border-border/60 bg-muted/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left Icon + Title + Days */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                          isCurrent
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : `0${step.step}`}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">
                            {stageTitle}
                          </h4>
                          <span className="text-xs text-muted-foreground">({stageSub})</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                              isCurrent
                                ? 'bg-emerald-600 text-white border-transparent'
                                : 'bg-background'
                            }`}
                          >
                            ⏱️ {step.dayRange}
                          </Badge>
                        </div>

                        <p className="text-xs text-foreground/90 font-medium">
                          {summary}
                        </p>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {details}
                        </p>
                      </div>
                    </div>

                    {/* Right Status Badge */}
                    <div className="sm:self-start shrink-0 flex items-center gap-2">
                      {isCurrent && (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 gap-1 animate-bounce">
                          <Zap className="h-3 w-3" />
                          {language === 'EN' ? 'Active Stage Now' : 'आज का चरण (Active Now)'}
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 text-[10px] font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                          {language === 'EN' ? 'Stage Completed' : 'पूर्ण हो चुका'}
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="outline" className="text-muted-foreground text-[10px] bg-background font-mono">
                          ⏳ {language === 'EN' ? `Starts in ${daysRemaining} days` : `${daysRemaining} दिन बाद शुरू होगा`}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Recommended Inputs & Warning Box */}
                  <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-8 p-2.5 rounded-lg bg-background/80 border border-border/80 space-y-1">
                      <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                        <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                        {language === 'EN'
                          ? 'Recommended Inputs, Fertilizer & Water Dosage:'
                          : 'खाद, पानी व दवा की अनुशंसित मात्रा:'}
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {inputs}
                      </p>
                    </div>

                    <div className="md:col-span-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="font-bold text-[11px] text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        {language === 'EN' ? 'Agronomy Caution:' : 'विशेष सावधानी (Caution):'}
                      </span>
                      <p className="text-[10px] text-amber-900/80 dark:text-amber-300 leading-snug">
                        {warning || (language === 'EN' ? 'Monitor soil moisture and local weather.' : 'नमी और मौसम का ध्यान रखें।')}
                      </p>
                    </div>
                  </div>

                  {/* Direct Log Button */}
                  {onNavigateToDiary && (
                    <div className="mt-2.5 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onNavigateToDiary}
                        className="h-7 text-[11px] text-primary hover:text-primary hover:bg-primary/10 gap-1 font-semibold cursor-pointer"
                      >
                        <span>
                          {language === 'EN'
                            ? 'Log This Activity in Kisan Diary'
                            : 'इस चरण की गतिविधि किसान डायरी में दर्ज करें'}
                        </span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
