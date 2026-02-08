import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// ⚠️ 중요: 폰트 로딩을 위해 Node.js 엔진 사용
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [1] 설정값 (색상 및 기념일)
  // ─────────────────────────────────────────────────────────────
  
  const c = {
    bg: '#F2F2F7',      // 배경
    text: '#1C1C1E',    // 글씨
    past: '#8E8E93',    // 🩶 지난 날
    current: '#F4900D', // 🧡 오늘
    future: '#C7C7CC',  // 🤍 미래 (기본)
    
    apricot: '#fb9b82', // 🧡 살구색
    blue: '#00498c',    // 💙 진한 파랑
    purple: '#C4BFE3',  // 💜 연한 보라
  };

  // 기념일 목록
  const specialDates: Record<string, string> = {
    '2026-01-04': c.apricot,
    '2026-01-09': c.apricot,
    '2026-03-27': c.apricot,
    '2026-05-22': c.apricot,
    '2026-11-19': c.apricot,

    '2026-03-28': c.blue,
    '2026-10-31': c.blue,

    '2026-03-26': c.purple,
  };

  // ─────────────────────────────────────────────────────────────
  // [2] 폰트 로딩 (실패 시 기본 폰트 사용)
  // ─────────────────────────────────────────────────────────────
  let fontData = null;
  try {
    const res = await fetch('https://github.com/google/fonts/raw/main/ofl/sniglet/Sniglet-Regular.ttf');
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.log('폰트 다운로드 실패');
    }
  } catch (e) {
    console.log('폰트 에러');
  }

  // ─────────────────────────────────────────────────────────────
  // [3] 날짜 계산
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
  
  const currentYear = parseInt(dateParts.year);
  const currentMonth = parseInt(dateParts.month) - 1; 
  const currentDay = parseInt(dateParts.day);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay(); 
    return day === 0 ? 6 : day - 1; 
  };

  // ─────────────────────────────────────────────────────────────
  // [4] 화면 그리기
  // ─────────────────────────────────────────────────────────────
  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', backgroundColor: c.bg,
        fontFamily: fontData ? 'Sniglet' : 'sans-serif', // 폰트 없으면 기본 고딕
      }}>
        {/* 연도 */}
        <div style={{ 
          fontSize: '100px', color: c.text, 
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
                <div style={{ fontSize: '36px', color: c.text, marginBottom: '20px', marginLeft: '5px' }}>
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
                    
                    let dotColor = c.future; 

                    // 우선순위 로직
                    if (mIndex < currentMonth) {
                      dotColor = c.past; 
                    } else if (mIndex === currentMonth) {
                      if (d < currentDay) dotColor = c.past;
                      else if (d === currentDay) dotColor = c.current;
                      else {
                        if (specialDates[dateString]) dotColor = specialDates[dateString];
                      }
                    } else {
                      if (specialDates[dateString]) dotColor = specialDates[dateString];
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
          fontSize: '30px', color: c.text,
          fontWeight: 'normal',
          fontFamily: fontData ? 'Sniglet' : 'sans-serif',
        }}>
          🧡 STEP UP 🏐 TO WIN 🧡
        </div>
      </div>
    ),
    {
      width: 1320, height: 2868,
      fonts: fontData ? [{ name: 'Sniglet', data: fontData, style: 'normal' }] : undefined,
    }
  );
}