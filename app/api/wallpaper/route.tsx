import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// 폰트와 날짜 계산을 위해 Node.js 엔진 사용
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [1] 설정: 색상 및 기념일 (여기를 확인하세요!)
  // ─────────────────────────────────────────────────────────────
  
  const c = {
    bg: '#F2F2F7',      // 배경
    text: '#1C1C1E',    // 글씨
    past: '#8E8E93',    // 🩶 지난 날 (회색)
    current: '#F4900D', // 🧡 오늘 (주황색)
    future: '#C7C7CC',  // 🤍 미래 (기본 연회색)
    
    // ✨ 요청하신 커스텀 색상
    apricot: '#fb9b82', // 🧡 살구색
    blue: '#00498c',    // 💙 진한 파랑
    purple: '#C4BFE3',  // 💜 연한 보라
  };

  // 📅 기념일 목록 (YYYY-MM-DD 형식)
  const specialDates: Record<string, string> = {
    // 살구색 그룹
    '2026-01-04': c.apricot,
    '2026-01-09': c.apricot,
    '2026-03-27': c.apricot,
    '2026-05-22': c.apricot,
    '2026-11-19': c.apricot,

    // 파랑색 그룹
    '2026-03-28': c.blue,
    '2026-10-31': c.blue,

    // 보라색 그룹
    '2026-03-26': c.purple,
  };

  // ─────────────────────────────────────────────────────────────
  // [2] 폰트 로딩 (Sniglet - 귀여운 폰트)
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
  // [3] 날짜 계산 (한국 시간)
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
  const currentMonth = parseInt(dateParts.month) - 1; // 0~11
  const currentDay = parseInt(dateParts.day);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay(); 
    return day === 0 ? 6 : day - 1; // 월요일 시작
  };

  // ─────────────────────────────────────────────────────────────
  // [4] 화면 그리기
  // ─────────────────────────────────────────────────────────────
  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', backgroundColor: c.bg,
        fontFamily: fontData ? 'Sniglet' : 'sans-serif',
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
                    
                    let dotColor = c.future; // 기본 미래색

                    // 🛠️ 우선순위 로직
                    if (mIndex < currentMonth) {
                      dotColor = c.past; // 지난 달 -> 회색
                    } else if (mIndex === currentMonth) {
                      if (d < currentDay) dotColor = c.past; // 지난 날 -> 회색
                      else if (d === currentDay) dotColor = c.current; // 오늘 -> 주황색
                      else {
                        // 미래 날짜: 기념일 확인
                        if (specialDates[dateString]) dotColor = specialDates[dateString];
                      }
                    } else {
                      // 미래 달: 기념일 확인
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

        {/* 하단 문구 (위치 81%) */}
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