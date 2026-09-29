/**
 * Open-Meteo Weather Intelligence & Agri-Advisory Service
 * 100% Free - No API Key Required
 */

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeed: number;
  rain: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  conditionHi: string;
  isDay: boolean;
}

export interface WeatherDailyForecast {
  date: string;
  dayName: string;
  dayNameHi: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  windSpeedMax: number;
  weatherCode: number;
  condition: string;
  conditionHi: string;
  isSprayWindowOpen: boolean;
}

export interface AgriSprayAssessment {
  status: 'OPTIMAL' | 'CAUTION' | 'RESTRICTED';
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  badgeHi: string;
  riskReasons: string[];
  riskReasonsHi: string[];
}

export interface DiseaseRiskAssessment {
  yellowRustRisk: 'LOW' | 'MODERATE' | 'HIGH';
  yellowRustBadgeHi: string;
  yellowRustAdviceHi: string;
  yellowRustAdviceEn: string;
  ureaAdviceHi: string;
  ureaAdviceEn: string;
  fullVoiceScriptHi: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
  country?: string;
}

// Fallback coordinates for common North-Indian wheat farming regions
const DEFAULT_INDIAN_LOCATIONS: Record<string, { lat: number; lon: number; nameHi: string }> = {
  karnal: { lat: 29.6857, lon: 76.9905, nameHi: 'करनाल' },
  ludhiana: { lat: 30.9010, lon: 75.8573, nameHi: 'लुधियाना' },
  amritsar: { lat: 31.6340, lon: 74.8723, nameHi: 'अमृतसर' },
  jalandhar: { lat: 31.3260, lon: 75.5762, nameHi: 'जालंधर' },
  patiala: { lat: 30.3398, lon: 76.3869, nameHi: 'पटियाला' },
  bathinda: { lat: 30.2110, lon: 74.9455, nameHi: 'बठिंडा' },
  samrala: { lat: 30.8354, lon: 76.1912, nameHi: 'समराला' },
  ambala: { lat: 30.3782, lon: 76.7767, nameHi: 'अंबाला' },
  kurukshetra: { lat: 29.9695, lon: 76.8783, nameHi: 'कुरुक्षेत्र' },
  hisar: { lat: 29.1492, lon: 75.7217, nameHi: 'हिसार' },
  rohtak: { lat: 28.8955, lon: 76.6066, nameHi: 'रोहतक' },
  meerut: { lat: 28.9845, lon: 77.7064, nameHi: 'मेरठ' },
  jaipur: { lat: 26.9124, lon: 75.7873, nameHi: 'जयपुर' },
  indore: { lat: 22.7196, lon: 75.8577, nameHi: 'इंदौर' },
  bhopal: { lat: 23.2599, lon: 77.4126, nameHi: 'भोपाल' },
};

/**
 * WMO Weather interpretation codes (WW) mapping to English and Hindi labels
 */
export function interpretWeatherCode(code: number): { condition: string; conditionHi: string; type: 'clear' | 'cloudy' | 'rain' | 'thunder' | 'fog' | 'snow' } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionHi: 'साफ आसमान और धूप', type: 'clear' };
    case 1:
      return { condition: 'Mainly Clear', conditionHi: 'मुख्य रूप से साफ मौसम', type: 'clear' };
    case 2:
      return { condition: 'Partly Cloudy', conditionHi: 'हल्के बादल', type: 'cloudy' };
    case 3:
      return { condition: 'Overcast', conditionHi: 'घने बादल', type: 'cloudy' };
    case 45:
    case 48:
      return { condition: 'Fog & Dew', conditionHi: 'कोहरा और ओस', type: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', conditionHi: 'हल्की बूंदाबांदी', type: 'rain' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain Showers', conditionHi: 'बारिश की संभावना', type: 'rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Light Snow / Hail', conditionHi: 'ओलावृष्टि / बर्फबारी', type: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Showers', conditionHi: 'तेज बारिश की बौछारें', type: 'rain' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', conditionHi: 'गरज-चमक के साथ आंधी/तूफान', type: 'thunder' };
    default:
      return { condition: 'Fair Weather', conditionHi: 'सामान्य मौसम', type: 'clear' };
  }
}

/**
 * Geocode City / District using Open-Meteo Geocoding API
 */
export async function geocodeLocation(cityName: string): Promise<LocationCoordinates> {
  const clean = cityName.trim().toLowerCase();
  
  if (DEFAULT_INDIAN_LOCATIONS[clean]) {
    const coords = DEFAULT_INDIAN_LOCATIONS[clean];
    return {
      latitude: coords.lat,
      longitude: coords.lon,
      name: cityName,
      country: 'India',
    };
  }

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const top = data.results[0];
      return {
        latitude: top.latitude,
        longitude: top.longitude,
        name: top.name,
        admin1: top.admin1,
        country: top.country,
      };
    }
  } catch {
    // Fallback to Karnal (Haryana agricultural center)
  }

  return {
    latitude: 29.6857,
    longitude: 76.9905,
    name: cityName || 'Karnal',
    country: 'India',
  };
}

/**
 * Fetch Live Weather & 7-Day Forecast from Open-Meteo
 */
export async function fetchLiveWeatherData(lat: number, lon: number, locationName: string = ''): Promise<{
  current: WeatherCurrent;
  daily: WeatherDailyForecast[];
  sprayAssessment: AgriSprayAssessment;
  diseaseRisk: DiseaseRiskAssessment;
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API returned status ${res.status}`);
  }

  const data = await res.json();
  const cur = data.current;
  const curInterpretation = interpretWeatherCode(cur.weather_code);

  const current: WeatherCurrent = {
    temperature: Math.round(cur.temperature_2m),
    apparentTemperature: Math.round(cur.apparent_temperature),
    relativeHumidity: Math.round(cur.relative_humidity_2m),
    windSpeed: Math.round(cur.wind_speed_10m),
    rain: cur.rain || 0,
    precipitation: cur.precipitation || 0,
    weatherCode: cur.weather_code,
    condition: curInterpretation.condition,
    conditionHi: curInterpretation.conditionHi,
    isDay: cur.is_day === 1,
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const daily: WeatherDailyForecast[] = [];

  const timeArr = data.daily?.time || [];
  for (let i = 0; i < Math.min(timeArr.length, 7); i++) {
    const dateStr = timeArr[i];
    const d = new Date(dateStr);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
    const dayLabelHi = i === 0 ? 'आज' : i === 1 ? 'कल' : dayNamesHi[d.getDay()];
    const wCode = data.daily.weather_code[i] ?? 0;
    const maxT = Math.round(data.daily.temperature_2m_max[i] ?? 25);
    const minT = Math.round(data.daily.temperature_2m_min[i] ?? 15);
    const rainPct = data.daily.precipitation_probability_max[i] ?? 0;
    const rainMm = data.daily.precipitation_sum[i] ?? 0;
    const windKmh = Math.round(data.daily.wind_speed_10m_max[i] ?? 10);
    const interp = interpretWeatherCode(wCode);

    const isSprayWindowOpen = windKmh <= 15 && rainPct <= 25 && wCode < 50;

    daily.push({
      date: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
      dayName: dayLabel,
      dayNameHi: dayLabelHi,
      tempMax: maxT,
      tempMin: minT,
      precipitationProbability: rainPct,
      precipitationSum: rainMm,
      windSpeedMax: windKmh,
      weatherCode: wCode,
      condition: interp.condition,
      conditionHi: interp.conditionHi,
      isSprayWindowOpen,
    });
  }

  // Calculate Spray Window Assessment
  const todayRainProb = daily[0]?.precipitationProbability || 0;
  const sprayAssessment = calculateSprayWindow(current, todayRainProb);

  // Calculate Disease Risk & full Hindi voice script
  const diseaseRisk = assessDiseaseRisks(current, sprayAssessment, locationName, todayRainProb);

  return {
    current,
    daily,
    sprayAssessment,
    diseaseRisk,
  };
}

function calculateSprayWindow(current: WeatherCurrent, todayRainProb: number): AgriSprayAssessment {
  const reasons: string[] = [];
  const reasonsHi: string[] = [];

  if (current.windSpeed > 20) {
    reasons.push(`High wind speed (${current.windSpeed} km/h) causes chemical drift loss.`);
    reasonsHi.push(`तेज हवा की गति (${current.windSpeed} किमी/घंटा) — दवा उड़कर नष्ट होने का खतरा।`);
  } else if (current.windSpeed > 14) {
    reasons.push(`Moderate breeze (${current.windSpeed} km/h). Spray early morning only.`);
    reasonsHi.push(`मध्यम हवा (${current.windSpeed} किमी/घंटा) — केवल सुबह के समय ही छिड़काव करें।`);
  }

  if (todayRainProb > 40 || current.rain > 0) {
    reasons.push(`High rain risk (${todayRainProb}%). Rain may wash away foliar applications.`);
    reasonsHi.push(`भारी बारिश का खतरा (${todayRainProb}%) — दवा पानी में धुलने की पूरी संभावना।`);
  }

  if (current.temperature > 34) {
    reasons.push(`High daytime temperature (${current.temperature}°C) may cause foliar burn.`);
    reasonsHi.push(`अधिक तापमान (${current.temperature}°C) — पत्तियों के झुलसने की संभावना।`);
  }

  if (reasons.length === 0) {
    return {
      status: 'OPTIMAL',
      title: 'Optimal Spray Window Active Today',
      titleHi: 'आज छिड़काव (स्प्रे) के लिए मौसम सर्वोत्तम है',
      description: `Wind speed is calm (${current.windSpeed} km/h) and no rain forecast for next 48 hours. Safe for herbicide, fungicide, or foliar nutrient sprays.`,
      descriptionHi: `हवा की गति शांत (${current.windSpeed} किमी/घंटा) है और अगले 48 घंटों में बारिश की कोई संभावना नहीं है। कीटनाशक, फफूंदनाशक एवं सूक्ष्म पोषक तत्वों के छिड़काव के लिए यह उत्तम समय है।`,
      badgeHi: 'स्प्रे विंडो खुली है',
      riskReasons: [],
      riskReasonsHi: [],
    };
  }

  if (current.windSpeed > 22 || todayRainProb > 50 || current.rain > 0) {
    return {
      status: 'RESTRICTED',
      title: 'Spraying Postponed / Not Recommended',
      titleHi: 'कीटनाशक व फफूंदनाशक छिड़काव स्थगित करें (अनुशंसित नहीं)',
      description: `Unfavorable weather conditions detected. Avoid chemical spray today to prevent pesticide wash-off or drift damage.`,
      descriptionHi: `प्रतिकूल मौसम दर्ज किया गया है। बारिश या तेज हवा के कारण छिड़काव तुरंत टालें, अन्यथा दवा बह जाएगी और लागत व्यर्थ होगी।`,
      badgeHi: 'स्प्रे विंडो बंद है',
      riskReasons: reasons,
      riskReasonsHi: reasonsHi,
    };
  }

  return {
    status: 'CAUTION',
    title: 'Spray With Caution (Early Morning Recommended)',
    titleHi: 'सावधानीपूर्वक छिड़काव करें (केवल सुबह के समय)',
    description: `Marginal conditions. Ensure coarse spray nozzles and complete application before 10:00 AM.`,
    descriptionHi: `हवा या हल्की नमी की स्थिति है। फ्लैट फैन नोजल का प्रयोग करें और सुबह 10 बजे से पहले छिड़काव पूरा कर लें।`,
    badgeHi: 'सावधानी से स्प्रे करें',
    riskReasons: reasons,
    riskReasonsHi: reasonsHi,
  };
}

function assessDiseaseRisks(
  current: WeatherCurrent,
  spray: AgriSprayAssessment,
  locationName: string,
  todayRainProb: number
): DiseaseRiskAssessment {
  let yellowRustRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let yellowRustBadgeHi = 'कम जोखिम';
  let yellowRustAdviceHi = 'मौसम स्थिर है। नियमित रूप से फसल की टिलरिंग और वानस्पतिक अवस्था का निरीक्षण करते रहें।';
  let yellowRustAdviceEn = 'Weather conditions are stable. Maintain regular scouting during tillering and flowering stages.';

  if (current.relativeHumidity >= 70 && current.temperature >= 12 && current.temperature <= 22) {
    yellowRustRisk = 'HIGH';
    yellowRustBadgeHi = 'उच्च चेतावनी (High Risk)';
    yellowRustAdviceHi =
      'सुबह की ओस और 15-20°C तापमान पीला रतुआ (Puccinia striiformis) फफूंद के अनुकूल है। निचली पत्तियों पर पीले पाउडर की धारियों की जांच करें। लक्षण दिखने पर प्रोपिकोनाजोल (टिल्ट 25% EC) @ 200 मिली प्रति 200 लीटर पानी प्रति एकड़ का छिड़काव करें।';
    yellowRustAdviceEn =
      'High humidity and cool dew temperatures strongly favor Yellow Stripe Rust. Inspect lower leaves daily. Apply Propiconazole 25 EC @ 200ml/acre.';
  } else if (current.relativeHumidity >= 60 && current.temperature >= 10 && current.temperature <= 25) {
    yellowRustRisk = 'MODERATE';
    yellowRustBadgeHi = 'मध्यम निगरानी (Moderate)';
    yellowRustAdviceHi =
      'हवा में नमी 60% से अधिक है। सुबह के समय खेत के किनारों और छायादार हिस्सों में फफूंद रोगों के प्रकोप की निगरानी रखें।';
    yellowRustAdviceEn =
      'Moderate relative humidity. Monitor field borders and shady areas for fungal rust onset.';
  }

  const ureaAdviceHi =
    todayRainProb > 40
      ? 'अगले 24 घंटों में बारिश की संभावना के कारण सिंचाई तुरंत रोक दें। जलभराव से बचें और बारिश रुकने के बाद ही यूरिया की टॉप-ड्रेसिंग करें।'
      : 'गेंहू में कल्ले फूटते समय (CRI Stage) पहली या दूसरी सिंचाई के साथ यूरिया नाइट्रोजन की दूसरी खुराक (लगभग 45 किग्रा प्रति एकड़) समान रूप से डालें।';

  const ureaAdviceEn =
    todayRainProb > 40
      ? 'Avoid irrigation due to imminent rainfall. Prevent water-logging.'
      : 'Synchronize top-dressing of urea (approx 45 kg/acre) with optimal soil moisture during crown root initiation.';

  // Construct pure natural Hindi voice script
  const locDisplay = locationName || 'आपके क्षेत्र';
  const sprayVoicePart =
    spray.status === 'OPTIMAL'
      ? 'आज मौसम साफ है और स्प्रे विंडो पूरी तरह खुली है। आप फफूंदनाशक या पोषक तत्वों का छिड़काव कर सकते हैं।'
      : spray.status === 'RESTRICTED'
      ? `मौसम विभाग के अनुसार आज ${current.conditionHi} और बारिश का जोखिम है, इसलिए आज किसी भी प्रकार का कीटनाशक या फफूंदनाशक छिड़काव न करें।`
      : 'आज हवा की गति को देखते हुए केवल सुबह के समय ही सावधानीपूर्वक स्प्रे करें।';

  const fullVoiceScriptHi = `नमस्ते किसान भाई! कृषि मौसम और गेहूं फसल बुलेटिन। ${locDisplay} में आज का तापमान ${current.temperature} डिग्री सेल्सियस है और हवा में नमी ${current.relativeHumidity} प्रतिशत है। ${sprayVoicePart}। रोग नियंत्रण सलाह: ${yellowRustAdviceHi}। सिंचाई और खाद सलाह: ${ureaAdviceHi}`;

  return {
    yellowRustRisk,
    yellowRustBadgeHi,
    yellowRustAdviceHi,
    yellowRustAdviceEn,
    ureaAdviceHi,
    ureaAdviceEn,
    fullVoiceScriptHi,
  };
}
