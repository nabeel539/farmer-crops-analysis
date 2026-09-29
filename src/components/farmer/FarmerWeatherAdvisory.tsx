'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWeather } from '@/hooks/useWeather';
import {
  Sun,
  CloudRain,
  CloudSun,
  Cloud,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Sprout,
  Activity,
  Calendar,
  Languages,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

interface FarmerWeatherAdvisoryProps {
  village?: string;
  district?: string;
  farmerName?: string;
}

function getWeatherIcon(weatherCode: number) {
  if (weatherCode === 0 || weatherCode === 1) return Sun;
  if (weatherCode === 2) return CloudSun;
  if (weatherCode === 3) return Cloud;
  if (weatherCode === 45 || weatherCode === 48) return CloudFog;
  if (weatherCode >= 51 && weatherCode <= 65) return CloudRain;
  if (weatherCode >= 80 && weatherCode <= 82) return CloudRain;
  if (weatherCode >= 95) return CloudLightning;
  return CloudSun;
}

export function FarmerWeatherAdvisory({ village = '', district = '', farmerName }: FarmerWeatherAdvisoryProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser = useAppSelector((state) => state.ui.currentUser);
  const resolvedFarmerName = (farmerName || authUser?.name || currentUser?.name || '').trim();

  const locationQuery = district || village || 'Karnal';
  const { coords, current, daily, sprayAssessment, diseaseRisk, isLoading, isRefreshing, lastUpdated, refreshWeather } =
    useWeather(locationQuery);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeLang, setActiveLang] = useState<'HI' | 'EN'>('HI');
  const hasAutoPlayedRef = React.useRef(false);

  const playSpeech = React.useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Voice synthesis is not supported on this browser.');
      return;
    }

    const rawText = diseaseRisk?.fullVoiceScriptHi || 'नमस्ते किसान भाई! कृषि मौसम और गेहूं फसल सलाहकार बुलेटिन।';
    const personalizedGreeting = resolvedFarmerName
      ? `नमस्ते ${resolvedFarmerName} भाई!`
      : 'नमस्ते किसान भाई!';

    const textToSpeak = rawText.replace(/नमस्ते किसान भाई!/g, personalizedGreeting);

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.90; // Natural pace for farmers

      const voices = window.speechSynthesis.getVoices();
      const hiVoice =
        voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')) ||
        voices.find((v) => v.lang.includes('IN'));

      if (hiVoice) {
        utterance.voice = hiVoice;
      }

      utterance.onstart = () => {
        setIsPlayingAudio(true);
      };
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis playback error:', err);
      setIsPlayingAudio(false);
    }
  }, [diseaseRisk, resolvedFarmerName]);

  // Autoplay voice advisory once data loads upon entering screen
  React.useEffect(() => {
    if (!isLoading && current && diseaseRisk && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      const timer = setTimeout(() => {
        playSpeech();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoading, current, diseaseRisk, playSpeech]);

  // Clean up audio when switching tabs / leaving screen
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      playSpeech();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Advisory Banner */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-background to-background dark:from-emerald-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base sm:text-lg font-bold">
                    {activeLang === 'HI'
                      ? 'कृषि-मौसम सलाह एवं कीटनाशक स्प्रे विंडो'
                      : 'Agri-Meteorological Weather & Spraying Window'}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 py-0 h-5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Daily Update (24h)
                  </Badge>
                </div>
                <CardDescription className="text-xs flex flex-wrap items-center gap-1.5 mt-0.5 text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    {coords?.name || district || village || 'करनाल'}
                    {coords?.admin1 ? `, ${coords.admin1}` : ''}
                  </span>
                  {lastUpdated && (
                    <span className="text-muted-foreground text-[11px]">
                      &bull; दैनिक बुलेटिन: {lastUpdated.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })},{' '}
                      {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveLang(activeLang === 'HI' ? 'EN' : 'HI')}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Languages className="h-3.5 w-3.5 text-primary" />
                <span>{activeLang === 'HI' ? 'English' : 'हिंदी'}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={refreshWeather}
                disabled={isLoading}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                size="sm"
                variant={isPlayingAudio ? 'default' : 'outline'}
                onClick={handleToggleAudio}
                className={`h-8 text-xs gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer font-semibold ${
                  isPlayingAudio ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse' : ''
                }`}
              >
                {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isPlayingAudio ? 'ऑडियो रोकें (Stop)' : 'वॉइस सलाह सुनें (Hindi)'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-5 space-y-5">
          {/* Current Live Weather Hero Bar */}
          {current && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Thermometer className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {activeLang === 'HI' ? 'वर्तमान तापमान' : 'Current Temp'}
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {current.temperature}°C{' '}
                    <span className="text-[11px] font-normal text-muted-foreground font-sans">
                      (महसूस {current.apparentTemperature}°C)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {activeLang === 'HI' ? 'हवा में नमी (Humidity)' : 'Relative Humidity'}
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">{current.relativeHumidity}%</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/15 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {activeLang === 'HI' ? 'हवा की गति' : 'Wind Speed'}
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">{current.windSpeed} km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {activeLang === 'HI' ? 'मौसम की स्थिति' : 'Sky Condition'}
                  </div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {activeLang === 'HI' ? current.conditionHi : current.condition}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Spraying Window Detailed Indicator */}
          {sprayAssessment && (
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                sprayAssessment.status === 'OPTIMAL'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : sprayAssessment.status === 'CAUTION'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                      sprayAssessment.status === 'OPTIMAL'
                        ? 'bg-emerald-600 text-white'
                        : sprayAssessment.status === 'CAUTION'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {sprayAssessment.status === 'OPTIMAL' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-bold text-sm ${
                        sprayAssessment.status === 'OPTIMAL'
                          ? 'text-emerald-950 dark:text-emerald-200'
                          : sprayAssessment.status === 'CAUTION'
                          ? 'text-amber-950 dark:text-amber-200'
                          : 'text-rose-950 dark:text-rose-200'
                      }`}
                    >
                      {activeLang === 'HI' ? sprayAssessment.titleHi : sprayAssessment.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {activeLang === 'HI' ? sprayAssessment.descriptionHi : sprayAssessment.description}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`self-start sm:self-auto font-bold text-xs py-1 px-2.5 shrink-0 ${
                    sprayAssessment.status === 'OPTIMAL'
                      ? 'bg-emerald-600 text-white'
                      : sprayAssessment.status === 'CAUTION'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {activeLang === 'HI'
                    ? sprayAssessment.badgeHi
                    : sprayAssessment.status === 'OPTIMAL'
                    ? 'Spray Window Open'
                    : sprayAssessment.status === 'CAUTION'
                    ? 'Caution Required'
                    : 'Window Closed'}
                </Badge>
              </div>

              {/* Reasons list in Hindi & English */}
              {((activeLang === 'HI' ? sprayAssessment.riskReasonsHi : sprayAssessment.riskReasons) || []).length > 0 && (
                <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                  {((activeLang === 'HI' ? sprayAssessment.riskReasonsHi : sprayAssessment.riskReasons) || []).map((r, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-background/90 border font-medium text-foreground shadow-2xs"
                    >
                      &bull; {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7-Day Live Outlook Cards */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>
                {activeLang === 'HI'
                  ? '7-दिवसीय कृषि मौसम पूर्वानुमान एवं स्प्रे अनुकूलता'
                  : '7-Day Agri-Weather Forecast & Spray Windows'}
              </span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground">
                Updated Daily via Open-Meteo
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-muted/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {daily.map((fc, i) => {
                  const Icon = getWeatherIcon(fc.weatherCode);
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center space-y-1.5 transition-all ${
                        i === 0
                          ? 'bg-background border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-card/70 border-border/70 hover:border-primary/40'
                      }`}
                    >
                      <div className="text-xs font-bold text-foreground">
                        {activeLang === 'HI' ? fc.dayNameHi : fc.dayName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{fc.date}</div>

                      <div className="w-7 h-7 mx-auto flex items-center justify-center text-amber-500">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="font-mono font-bold text-xs text-foreground">
                        {fc.tempMax}° / <span className="text-muted-foreground text-[11px]">{fc.tempMin}°</span>
                      </div>

                      <div
                        className="text-[10px] text-muted-foreground truncate"
                        title={activeLang === 'HI' ? fc.conditionHi : fc.condition}
                      >
                        {activeLang === 'HI' ? fc.conditionHi : fc.condition}
                      </div>

                      <div className="pt-1 border-t border-border/50 text-[10px] flex items-center justify-between font-mono">
                        <span className="text-blue-600 flex items-center gap-0.5" title="Rain probability">
                          <Droplets className="h-2.5 w-2.5" /> {fc.precipitationProbability}%
                        </span>
                        <span className="text-muted-foreground flex items-center gap-0.5" title="Wind speed">
                          <Wind className="h-2.5 w-2.5" /> {fc.windSpeedMax}k
                        </span>
                      </div>

                      <div className="pt-0.5">
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-medium block truncate ${
                            fc.isSprayWindowOpen
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {fc.isSprayWindowOpen
                            ? activeLang === 'HI'
                              ? '✓ स्प्रे अनुकूल'
                              : '✓ Spray Safe'
                            : activeLang === 'HI'
                            ? '✗ स्प्रे न करें'
                            : '✗ Avoid Spray'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Agronomic Advisories & Disease Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Yellow Rust Disease Alert Card */}
        <Card className="border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {activeLang === 'HI'
                    ? 'पीला रतुआ (Yellow Rust) रोग निगरानी'
                    : 'Yellow Rust (Puccinia striiformis) Surveillance'}
                </CardTitle>
              </div>
              <Badge
                className={`text-[10px] font-bold ${
                  diseaseRisk?.yellowRustRisk === 'HIGH'
                    ? 'bg-rose-600 text-white'
                    : diseaseRisk?.yellowRustRisk === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                }`}
              >
                {activeLang === 'HI' ? diseaseRisk?.yellowRustBadgeHi : `${diseaseRisk?.yellowRustRisk} RISK`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="p-3.5 rounded-lg bg-background border border-amber-300 dark:border-amber-900/50 space-y-2">
              <p className="text-xs text-foreground leading-relaxed">
                {activeLang === 'HI' ? diseaseRisk?.yellowRustAdviceHi : diseaseRisk?.yellowRustAdviceEn}
              </p>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>उपचार सिफारिश:</strong> प्रोपिकोनाजोल 25% EC (टिल्ट / नैटिवो) @ 200 मिली प्रति 200 लीटर पानी प्रति एकड़।
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urea Nitrogen & Irrigation Management */}
        <Card className="border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-blue-600 shrink-0" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {activeLang === 'HI'
                    ? 'सिंचाई एवं यूरिया टॉप-ड्रेसिंग प्रबंधन'
                    : 'Irrigation & Urea Top-Dressing Guidance'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30">
                ICAR-IIWBR Best Practice
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="p-3.5 rounded-lg bg-background border border-blue-300 dark:border-blue-900/50 space-y-2">
              <p className="text-xs text-foreground leading-relaxed">
                {activeLang === 'HI' ? diseaseRisk?.ureaAdviceHi : diseaseRisk?.ureaAdviceEn}
              </p>
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-200">
                <strong>सलाह:</strong> कल्ले फूटते समय (Crown Root Initiation) खेत में पर्याप्त नमी बनाए रखें ताकि कल्लों का भरपूर विकास हो सके।
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
