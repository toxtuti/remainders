import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // 1. 지은님 전용 색상 및 설정
    // ─────────────────────────────────────────────────────────────
    const colors = {
      bg: '#F2F2F7',       // 배경
      text: '#1C1C1E',     // 글씨
      past: '#8E8E93',     // 지난 날
      current: '#F4900D',  // 오늘 (주황색)
      future: '#C7C7CC',   // 미래
    };

    const width = 1320;
    const height = 2868;
    const year = new Date().getFullYear();
    const isMondayFirst = true; // 월요일부터 시작

    // 한국 시간 계산
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstGap = 9 * 60 * 60 * 1000;
    const today = new Date(utc + kstGap);
    
    // 오늘 날짜 정보
    const currentMonth = today.getMonth(); // 0~11
    const currentDay = today.getDate();

    // ─────────────────────────────────────────────────────────────
    // 2. 달력 계산 로직 (요일 정렬 기능 추가)
    // ─────────────────────────────────────────────────────────────
    const months = [
      { name: 'JAN', days: 31 },
      { name: 'FEB', days: (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28 },
      { name: 'MAR', days: 31 }, { name: 'APR', days: 30 }, { name: 'MAY', days: 31 }, { name: 'JUN', days: 30 },
      { name: 'JUL', days: 31 }, { name: 'AUG', days: 31 }, { name: 'SEP', days: 30 }, { name: 'OCT', days: 31 },
      { name: 'NOV', days: 30 }, { name: 'DEC', days: 31 },
    ];

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg,
          padding: '80px 40px', fontFamily: 'sans-serif'
        }}>
          {/* 연도 제목 */}
          <div style={{ fontSize: '100px', fontWeight: 900, color: colors.text, marginBottom: '60px', letterSpacing: '-0.05em' }}>
            {year}
          </div>

          {/* 3열 4행 그리드 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px', width: '100%', maxWidth: '1200px' }}>
            {months.map((month, mIndex) => {
              // 해당 월 1일의 요일 계산 (0:일, 1:월 ... 6:토)
              const firstDay = new Date(year, mIndex, 1).getDay();
              // 월요일 시작 보정: 일(0) -> 6, 월(1) -> 0 ...
              const startOffset = isMondayFirst ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;

              return (
                <div key={month.name} style={{ display: 'flex', flexDirection: 'column', width: '300px', marginBottom: '30px' }}>
                  {/* 월 이름 */}
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text, marginBottom: '20px', marginLeft: '4px' }}>
                    {month.name}
                  </div>
                  
                  {/* 날짜 그리드 (7칸씩 끊기) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                    
                    {/* 앞쪽 빈칸 (요일 맞추기용) */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ width: '24px', height: '24px' }} />
                    ))}

                    {/* 날짜 점 찍기 */}
                    {Array.from({ length: month.days }).map((_, dIndex) => {
                      const dayNum = dIndex + 1;
                      let dotColor = colors.future; // 기본 미래 색

                      if (mIndex < currentMonth) {
                        dotColor = colors.past; // 지난 달
                      } else if (mIndex === currentMonth) {
                        if (dayNum < currentDay) dotColor = colors.past; // 이번달 지난 날
                        else if (dayNum === currentDay) dotColor = colors.current; // 🔥 오늘!
                      }

                      return (
                        <div key={dIndex} style={{
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
          <div style={{ position: 'absolute', bottom: '60px', color: colors.text, opacity: 0.4, fontSize: '24px', letterSpacing: '2px' }}>
            MEMENTO MORI
          </div>
        </div>
      ),
      { width, height }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}