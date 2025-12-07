import React, { useState, useEffect } from 'react';
import { Lunar, Solar } from '@ilin6/lunar-calendar'; // <-- 導入路徑必須和套件名稱一致
import { MapPin, Cloud, CloudRain, Sun, Moon } from 'lucide-react';

// 模擬天氣數據 (實際開發需串接 OpenWeatherMap 或中央氣象局 API)
const WEATHER_DATA = {
  '台北': { temp: 24, condition: '多雲', icon: <Cloud size={20} /> },
  '台中': { temp: 26, condition: '晴', icon: <Sun size={20} /> },
  '高雄': { temp: 28, condition: '晴', icon: <Sun size={20} /> },
  '東京': { temp: 15, condition: '雨', icon: <CloudRain size={20} /> },
};

const TraditionalCalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState('台北');
  
  // 每一秒更新時間
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 獲取農曆與曆法資訊
  const solar = Solar.fromDate(currentDate);
  const lunar = Lunar.fromDate(currentDate);
  
  // 格式化數據
  const year = solar.getYear();
  const month = solar.getMonth();
  const day = solar.getDay();
  const weekDay = solar.getWeek(); // 0-6
  const weekDayChi = ['日', '一', '二', '三', '四', '五', '六'][weekDay];
  
  // 農曆數據
  const lunarMonthChi = lunar.getMonthInChinese();
  const lunarDayChi = lunar.getDayInChinese();
  const ganZhiYear = lunar.getYearInGanZhi(); // 乙巳
  const zodiac = lunar.getYearShengXiao(); // 蛇
  const jieQi = lunar.getJieQi(); // 節氣
  const yi = lunar.getDayYi(); // 宜
  const ji = lunar.getDayJi(); // 忌
  const timeZhi = lunar.getTimeZhi(); // 時辰
  
  // 顏色定義 (參考圖片)
  const themeColor = "text-[#1a6b43]"; // 深綠色文字
  const themeBg = "bg-[#1a6b43]"; // 深綠色背景
  const borderCol = "border-[#1a6b43]"; // 深綠色邊框

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

        {/* --- 城市與即時時間 (App 特有功能) --- */}
        <div className="flex justify-between items-center px-4 py-1 bg-green-50 text-xs border-b border-green-200">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-green-700"/>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent font-bold text-green-800 outline-none"
            >
              {Object.keys(WEATHER_DATA).map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <span className="text-green-800 ml-1">
              {WEATHER_DATA[selectedCity].temp}°C {WEATHER_DATA[selectedCity].condition}
            </span>
          </div>
          <div className="font-mono font-bold text-green-800">
            {currentDate.toLocaleTimeString()}
          </div>
        </div>

        {/* --- 中間巨大日期區域 --- */}
        <div className="flex-1 flex items-center justify-center relative py-4">
          {/* 左側與右側的裝飾文字 (參考圖片) */}
          <div className="absolute left-4 top-10 text-xs text-gray-400 writing-vertical-rl h-32 leading-4">
             土腰子看吉示 —— 裝模做樣
          </div>
          <div className="absolute right-4 top-10 text-xs text-gray-400 writing-vertical-rl h-40 leading-4">
             諸葛武侯擇日：天財。批日、天財日出行者...
          </div>

          {/* 核心數字 */}
          <div className={`text-[180px] leading-none font-bold ${themeColor} relative select-none`} style={{ fontFamily: '"Times New Roman", serif' }}>
            {day}
            {/* 嵌入數字內的小動物 (簡化處理) */}
            <div className="absolute bottom-10 right-8 text-white text-4xl opacity-80">
               {/* 這裡可以用 SVG 放置生肖圖案 */}
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
                    {lunar.getHou()}
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
                        <span>喜神 {lunar.getPositionXi()}</span>
                        <span>財神 {lunar.getPositionCai()}</span>
                        <span>福神 {lunar.getPositionFu()}</span>
                    </div>
                </div>

                {/* 天干地支 */}
                <div className="border-b border-green-600 p-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-x-1 text-left">
                        <span className="text-gray-500">天干</span> <span className="font-bold">{lunar.getYearGan()}</span>
                        <span className="text-gray-500">地支</span> <span className="font-bold">{lunar.getYearZhi()}</span>
                        <span className="text-gray-500">五行</span> <span className="font-bold">{lunar.getYearNaYin().substring(0,2)}</span>
                        <span className="text-gray-500">星宿</span> <span className="font-bold">{lunar.getXiu()}</span>
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
