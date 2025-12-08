import React, { useState, useEffect } from 'react';
import { Calendar } from 'calendar-js';
// 導入所有需要的圖標
import { MapPin, Cloud, CloudRain, Sun, Moon, Zap, CloudFog } from 'lucide-react';

// --- 天氣圖標映射函數 ---
// 根據 CWA (Wx) 的描述，回傳對應的 Lucide Icon
const getWeatherIcon = (description) => {
  if (!description) return <Cloud size={14} className="text-green-700"/>; // 預設
  
  // 檢查關鍵字來決定圖標
  if (description.includes('晴')) {
    return <Sun size={14} className="text-green-700"/>;
  } else if (description.includes('雨') || description.includes('雷')) {
    return <CloudRain size={14} className="text-green-700"/>;
  } else if (description.includes('多雲') || description.includes('陰')) {
    return <Cloud size={14} className="text-green-700"/>;
  } else if (description.includes('霧')) {
    return <CloudFog size={14} className="text-green-700"/>;
  }
  return <Cloud size={14} className="text-green-700"/>; // 預設多雲
};

const TraditionalCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // 1. 預設城市為 CWA 常用的「臺北市」
  const [selectedCity, setSelectedCity] = useState('臺北市'); 
  // 2. 儲存所有城市的動態天氣數據，初始為空物件 {}
  const [weatherData, setWeatherData] = useState({}); 
  // 3. 載入狀態
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // 計時器：保持右下角的時間更新
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);

    // --- CWA API 獲取天氣數據的非同步函數 (高安全性版本) ---
    const fetchWeather = async () => {
        // CWA 鄉鎮天氣預報 API 端點 (F-C0032-005)
        const API_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-005";
        // 你提供的 API 金鑰
        const API_KEY = "CWA-A6F3874E-27F3-4AA3-AF5A-96B365798F79"; 
        
        const requestUrl = `${API_URL}?Authorization=${API_KEY}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                // 即使 HTTP 錯誤，也要解除載入狀態
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // --- JSON 數據解析邏輯 (極致安全防護) ---
            // 確保路徑存在，否則設為空陣列
            const locations = data?.records?.location || []; 
            
            if (locations.length === 0) {
                console.error("CWA API returned no location data.");
                setWeatherData({}); 
                setIsLoading(false);
                return; 
            }
            
            // 使用 reduce 安全地轉換數據格式
            const finalData = locations.reduce((acc, location) => {
                const cityName = location.locationName;
                const elements = location.weatherElement;
                
                // 使用 ?. 確保在任何層級遺失數據時都不崩潰
                const weatherElement = elements?.find(e => e.elementName === 'Wx');
                const minTempElement = elements?.find(e => e.elementName === 'MinT');
                const maxTempElement = elements?.find(e => e.elementName === 'MaxT');

                // 從第一個時間段 (time[0]) 提取數據，並使用 || 設置預設值
                const condition = weatherElement?.time[0]?.parameter?.parameterName || 'N/A';
                const minTemp = minTempElement?.time[0]?.parameter?.parameterName || '--';
                const maxTemp = maxTempElement?.time[0]?.parameter?.parameterName || '--';

                acc[cityName] = {
                    minTemp: parseInt(minTemp) || minTemp,
                    maxTemp: parseInt(maxTemp) || maxTemp,
                    condition: condition,
                };
                return acc;
            }, {});

            setWeatherData(finalData);
            setIsLoading(false);

        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            setIsLoading(false); 
        }
    };
    
    // 首次載入時呼叫
    fetchWeather();

    return () => clearInterval(timer);
  }, []); 

  // --- 動態曆法核心邏輯與安全檢查 ---
  const calendar = new Calendar(currentDate); 
  const lunar = calendar.getLunarInfo(); 
  const solar = calendar.getSolarInfo(); 
  
  // 核心安全檢查 (防白螢幕 1): 曆法數據載入檢查
  if (!lunar || !solar) {
      return <div className="min-h-screen flex items-center justify-center font-serif text-gray-500">曆法數據載入中...</div>;
  }
  
  // 曆法數據
  const year = solar.year;
  const month = solar.month;
  const day = solar.day;
  const weekDay = solar.week; 
  const weekDayChi = ['日', '一', '二', '三', '四', '五', '六'][weekDay];
  
  const lunarMonthChi = lunar.lunarMonthName;
  const lunarDayChi = lunar.lunarDayName;
  // 安全修正 (防白螢幕 2): 確保 ganZhiYear 永遠是字串，以避免 .substring() 崩潰
  const ganZhiYear = lunar.ganZhiYear || ''; 
  const jieQi = lunar.solarTerm; 
  
  // --- 當前天氣數據 (安全提取) ---
  // 使用 ?. 確保即使 weatherData 裡沒有該城市也不會崩潰
  const currentCityWeather = weatherData[selectedCity];
  const displayMinTemp = currentCityWeather?.minTemp || '--';
  const displayMaxTemp = currentCityWeather?.maxTemp || '--';
  const displayCondition = currentCityWeather?.condition || '載入中...';
  
  // --- UI 輔助數據 ---
  const yi = ["祭祀", "開光", "裁衣", "交易", "立券"];
  const ji = ["嫁娶", "安葬", "入宅", "出行"];
  const themeColor = "text-[#1a6b43]";
  const themeBg = "bg-[#1a6b43]";
  const borderCol = "border-[#1a6b43]";
  
  // 核心安全檢查 (防白螢幕 3): 天氣數據載入檢查
  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center font-serif text-gray-500">天氣數據載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-serif">
      {/* 日曆紙本體容器 */}
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col border-t-8 border-gray-200">
        
        {/* --- 頂部 Header: 年份與月份 --- */}
        <div className={`flex justify-between items-end px-4 pt-4 pb-2 ${borderCol} border-b-2`}>
          <div className="flex flex-col">
             <div className="text-xs text-gray-500">西元</div>
             <div className={`text-4xl font-bold ${themeColor}`}>{year}</div>
          </div>
          
          {/* 裝飾性福字 Logo */}
          <div className={`rounded-full border-2 ${borderCol} p-1 w-12 h-12 flex items-center justify-center`}>
            <span className={`${themeColor} font-bold text-xl`}>福</span>
          </div>

          <div className="flex flex-col items-end">
             <div className={`text-2xl font-bold ${themeColor}`}>{month}月大 <span className="text-lg">JAN</span></div>
             <div className="text-xs text-right text-gray-500">農曆{ganZhiYear}年</div>
          </div>
        </div>

        {/* --- 城市與即時時間 (動態天氣顯示) --- */}
        <div className="flex justify-between items-center px-4 py-1 bg-green-50 text-xs border-b border-green-200">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-green-700"/>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent font-bold text-green-800 outline-none"
            >
              {/* 城市列表從動態獲取的天氣數據中提取 */}
              {Object.keys(weatherData).map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            {/* 顯示動態天氣狀況和溫度範圍 */}
            <span className="text-green-800 ml-1 flex items-center gap-1">
              {getWeatherIcon(displayCondition)}
              {displayMinTemp}°C - {displayMaxTemp}°C ({displayCondition})
            </span>
          </div>
          <div className="font-mono font-bold text-green-800">
            {currentDate.toLocaleTimeString()}
          </div>
        </div>

        {/* --- 中間巨大日期區域 --- */}
        <div className="flex-1 flex items-center justify-center relative py-4">
          {/* 左側與右側的裝飾文字 (已修正 Z-index: z-10，位置: top-4) */}
          <div className="absolute left-4 top-4 text-xs text-gray-400 writing-vertical-rl h-32 leading-4 z-10">
             土腰子看吉示 —— 裝模做樣
          </div>
          <div className="absolute right-4 top-4 text-xs text-gray-400 writing-vertical-rl h-40 leading-4 z-10">
             諸葛武侯擇日：天財。批日、天財日出行者...
          </div>

          {/* 核心數字 */}
          <div className={`text-[180px] leading-none font-bold ${themeColor} relative select-none`} style={{ fontFamily: '"Times New Roman", serif' }}>
            {day}
            <div className="absolute bottom-10 right-8 text-white text-4xl opacity-80">
               {/* 生肖圖案 */}
            </div>
          </div>
        </div>

        {/* --- 中段資訊條 (農曆/節氣/星期) --- */}
        <div className={`border-t-2 border-b-2 ${borderCol} mx-2 mb-2 flex items-stretch h-16`}>
            {/* 農曆日期 */}
            <div className="flex-1 flex items-center justify-center border-r border-dashed border-green-600">
                <div className={`text-3xl font-black ${themeColor}`}>
                    {lunarMonthChi}月{lunarDayChi}
                </div>
            </div>
            
            {/* 中央節氣區 */}
            <div className="w-1/4 flex flex-col items-center justify-center px-1 text-center">
                <div className="text-xs text-gray-500 transform scale-90">節氣</div>
                <div className={`font-bold ${themeColor}`}>{jieQi || '無節氣'}</div>
                <div className="text-[10px] text-gray-500 leading-tight mt-1">
                    {/* 候 */}
                </div>
            </div>

            {/* 星期 */}
            <div className={`flex-1 flex flex-col items-center justify-center border-l border-dashed border-green-600`}>
                <div className={`text-3xl font-black ${themeColor}`}>星期{weekDayChi}</div>
                <div className="text-xs font-bold tracking-widest text-green-700 uppercase">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
            </div>
        </div>

        {/* --- 底部複雜表格 Grid (宜忌/吉神/時辰) --- */}
        <div className={`mx-2 mb-2 border-2 ${borderCol} grid grid-cols-5 text-center text-xs`}>
            
            {/* 1. 最左側：宜 */}
            <div className="col-span-1 border-r border-green-600 flex flex-col">
                <div className={`py-1 text-white font-bold text-lg rounded-full w-8 h-8 mx-auto mt-2 flex items-center justify-center ${themeBg}`}>
                    宜
                </div>
                <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1 text-green-900 font-medium">
                    {/* 使用模擬數據 */}
                    {yi.slice(0, 5).map((act, i) => <span key={i}>{act}</span>)}
                </div>
                <div className={`border-t border-green-600 py-1 ${themeColor}`}>
                    本日貴人時<br/>
                    <span className="font-bold">丑 午</span>
                </div>
            </div>

            {/* 2. 中間區域：密密麻麻的資訊 */}
            <div className="col-span-3 grid grid-cols-2 grid-rows-3 text-[10px]">
                {/* 時辰吉凶表頭 */}
                <div className="col-span-2 row-span-1 border-b border-green-600 flex items-center justify-between px-1 bg-green-50">
                   <span>時辰</span>
                   <span className="flex gap-1">
                      {['子','丑','寅','卯','辰','巳'].map(t => <span key={t}>{t}</span>)}
                   </span>
                </div>

                {/* 吉神方位 */}
                <div className="border-r border-b border-green-600 p-1 flex flex-col justify-center">
                    <div className={`${themeBg} text-white px-1 mb-1`}>吉神方位</div>
                    <div className="grid grid-cols-2 text-left px-2">
                        <span>喜神 東北</span>
                        <span>財神 南</span>
                        <span>福神 西</span>
                    </div>
                </div>

                {/* 天干地支 (動態且安全) */}
                <div className="border-b border-green-600 p-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-x-1 text-left">
                        <span className="text-gray-500">天干</span> <span className="font-bold">{ganZhiYear.substring(0, 1)}</span>
                        <span className="text-gray-500">地支</span> <span className="font-bold">{ganZhiYear.substring(1, 2)}</span>
                        <span className="text-gray-500">五行</span> <span className="font-bold">火</span>
                        <span className="text-gray-500">星宿</span> <span className="font-bold">危</span>
                    </div>
                </div>

                {/* 下方八卦圖佔位 */}
                <div className="col-span-2 p-1 flex items-center justify-center relative">
                    <div className="w-16 h-16 border border-green-400 rounded-full flex items-center justify-center text-green-200">
                        八卦圖
                    </div>
                    <div className="absolute bottom-1 right-1 text-green-800 font-bold">
                        今日吉數: {day + 2} {day + 8}
                    </div>
                </div>
            </div>

            {/* 3. 最右側：忌 */}
            <div className="col-span-1 border-l border-green-600 flex flex-col">
                <div className={`py-1 text-white font-bold text-lg rounded-full w-8 h-8 mx-auto mt-2 flex items-center justify-center ${themeBg}`}>
                    忌
                </div>
                <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1 text-green-900 font-medium">
                    {/* 使用模擬數據 */}
                    {ji.slice(0, 4).map((act, i) => <span key={i}>{act}</span>)}
                </div>
                <div className={`border-t border-green-600 py-1 ${themeColor}`}>
                     若論功臣<br/>莫忘懷
                </div>
            </div>
        </div>

        {/* --- 底部 Footer --- */}
        <div className={`bg-[#1a6b43] text-white p-2 text-sm flex justify-between items-center mx-2 mb-4 rounded-b-sm`}>
            <div className="font-bold">六合 · 豬</div>
            <div className="flex gap-2 text-xs">
               <span>漲潮: 4:10</span>
               <span>落潮: 8:20</span>
            </div>
        </div>
        
        {/* 紙張撕裂效果 (視覺裝飾) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-gray-300 to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

export default TraditionalCalendarApp;
