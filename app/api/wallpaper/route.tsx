import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [1] 폰트 로딩 (Sniglet - 귀여운 폰트)
  // ─────────────────────────────────────────────────────────────
  let fontData = null;
  try {
    const res = await fetch('https://github.com/google/fonts/raw/main/ofl/sniglet/Sniglet-Regular.ttf');
    if (res.ok) fontData = await res.arrayBuffer();
  } catch (e) { console.error(e); }

  try {
    // ─────────────────────────────────────────────────────────────
    // [2] 설정 및 기념일 입력 (요청하신 날짜 적용 완료!)
    // ─────────────────────────────────────────────────────────────
    
    // 🎨 날짜별 색상 지정
    const specialDates: Record<string, string> = {
      // 🧡 #fb9b82 (살구색)
      '2026-01-04': '#fb9b82',
      '2026-01-09': '#fb9b82',
      '2026-03-27': '#fb9b82',
      '2026-05-22': '#fb9b82',
      '2026-11-19': '#fb9b82',

      // 💙 #00498c (진한 파랑)
      '2026-03-28': '#00498c',
      '2026-10-31': '#00498c',

      // 💜 #C4BFE3 (연한 보라)
      '2026-03-26': '#C4BFE3',
    };

    const config = {
      width: 1320, height: 2868,
      colors: {
        bg: '#F2F2F7',      // 배경
        text: '#1C1C1E',    // 글씨
        past: '#8E8E93',    // 🩶 지난 날 (기념일이어도 지나면 이 색!)
        current: '#F4900D', // 🧡 오늘
        future: '#C7C7CC',  // 🤍 미래 (일반 날짜)
      },
    };

    // ─────────────────────────────────────────────────────────────
    // [3] 날짜 계산 및 그리기 로직
    // ─────────────────────────────────────────────────────────────
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const dateParts: Record<string, string> = {};
    parts.forEach(({ type, value }) => dateParts[type] = value);
    
    // 오늘 날짜 정보
    const currentYear = parseInt(dateParts.year);
    const currentMonth = parseInt(dateParts.month) - 1; // 0~11
    const currentDay = parseInt(dateParts.day);

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDay = (y: number, m: number) => {
      const day = new Date(y, m, 1).getDay(); 
      return day === 0 ? 6 : day - 1; // 월요일 시작
    };

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', backgroundColor: config.colors.bg,
          fontFamily: fontData ? 'Sniglet' : 'sans-serif',
        }}>
          {/* 연도 */}
          <div style={{ 
            fontSize: '100px', color: config.colors.text, 
            marginTop: '180px', marginBottom: '80px' 
          }}>
            {currentYear}
          </div>

          {/* 달력 그리드 */}
          <div style={{ 
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', 
            width: '1100px', gap: '60px' 
          }}>
            {months.map((monthName, mIndex) => {
              const totalDays = daysInMonth(currentYear, mIndex);
              const startOffset = getFirstDay(currentYear, mIndex);
              
              return (
                <div key={monthName} style={{ display: 'flex', flexDirection: 'column', width: '300px', marginBottom: '40px' }}>
                  <div style={{ fontSize: '36px', color: config.colors.text, marginBottom: '20px', marginLeft: '5px' }}>
                    {monthName}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                    {/* 빈칸 */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ width: '24px', height: '24px' }} />
                    ))}

                    {/* 날짜 점 */}
                    {Array.from({ length: totalDays }).map((_, i) => {
                      const d = i + 1;
                      const dateString = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      
                      let dotColor = config.colors.future; // 기본값

                      // 🛠️ 우선순위 로직: 과거(회색) -> 오늘(주황) -> 미래(기념일)
                      
                      if (mIndex < currentMonth) {
                        dotColor = config.colors.past; // 지난 달
                      } 
                      else if (mIndex === currentMonth && d < currentDay) {
                        dotColor = config.colors.past; // 이번 달 지난 날
                      }
                      else if (mIndex === currentMonth && d === currentDay) {
                        dotColor = config.colors.current; // 오늘
                      }
                      else {
                        // 미래 날짜일 때만 기념일 색상 적용
                        if (specialDates[dateString]) {
                          dotColor = specialDates[dateString]; 
                        } else {
                          dotColor = config.colors.future;
                        }
                      }

                      return (
                        <div key={d} style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          backgroundColor: dotColor,
                        }} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 문구 */}
          <div style={{
            position: 'absolute', top: '81%', width: '100%',
            display: 'flex', justifyContent: 'center',
            fontSize: '30px', color: config.colors.text,
          }}>
            🧡 STEP UP 🏐 TO WIN 🧡
          </div>
        </div>
      ),
      {
        width: config.width, height: config.height,
        fonts: fontData ? [{ name: 'Sniglet', data: fontData, style: 'normal' }] : undefined,
      }
    );
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}