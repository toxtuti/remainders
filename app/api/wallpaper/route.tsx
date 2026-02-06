/**
 * 100% 자립형 캘린더 코드 (외부 파일 의존성 제거됨)
 * 지은님의 '소프트 라이트 모드' + 'Year View' 전용
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// ⚠️ 중요: Vercel 무료 버전에서 가장 안정적인 'edge' 엔진을 사용합니다.
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // 1. 색상 및 설정 (지은님 전용)
    // ─────────────────────────────────────────────────────────────
    const colors = {
      bg: '#F2F2F7',      // 배경: 연회색
      text: '#1C1C1E',    // 글씨: 진회색
      past: '#8E8E93',    // 지난 날: 회색
      current: '#F4900D', // 오늘: 주황색 포인트
      future: '#C7C7CC',  // 미래: 연한 회색
    };

    const width = 1320;
    const height = 2868;
    
    // 날짜 계산 (한국 시간)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    
    const currentYear = kstDate.getUTCFullYear();
    const currentMonth = kstDate.getUTCMonth(); // 0부터 시작
    const currentDay = kstDate.getUTCDate();

    // ─────────────────────────────────────────────────────────────
    // 2. 화면 그리기 (HTML/CSS를 여기서 바로 만듭니다)
    // ─────────────────────────────────────────────────────────────
    
    // 월별 날짜 수 (윤년 계산 포함)
    const daysInMonth = [31, (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 1. 상단 제목 (연도) */}
          <div style={{ display: 'flex', marginBottom: '60px', width: '100%', justifyContent: 'center' }}>
            <span style={{ fontSize: '120px', fontWeight: 900, color: colors.text, letterSpacing: '-5px' }}>
              {currentYear}
            </span>
          </div>

          {/* 2. 달력 그리드 (3열 4행) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px', width: '100%' }}>
            {monthNames.map((name, mIndex) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', width: '340px', marginBottom: '40px' }}>
                {/* 월 이름 */}
                <span style={{ fontSize: '40px', fontWeight: 'bold', color: colors.text, marginBottom: '20px', marginLeft: '10px' }}>
                  {name}
                </span>
                
                {/* 날짜 점들 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {Array.from({ length: daysInMonth[mIndex] }).map((_, dIndex) => {
                    const dayNum = dIndex + 1;
                    
                    // 색상 결정 로직
                    let dotColor = colors.future; // 기본 미래
                    
                    // 지난 달이거나, 이번 달인데 날짜가 지났으면
                    if (mIndex < currentMonth) {
                      dotColor = colors.past;
                    } else if (mIndex === currentMonth) {
                      if (dayNum < currentDay) dotColor = colors.past;
                      else if (dayNum === currentDay) dotColor = colors.current; // 🔥 오늘!
                    }

                    return (
                      <div
                        key={dIndex}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* 3. 하단 문구 (선택사항) */}
          <div style={{ position: 'absolute', bottom: '100px', color: colors.text, opacity: 0.5, fontSize: '30px' }}>
            MEMENTO MORI
          </div>
        </div>
      ),
      {
        width: width,
        height: height,
      }
    );
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}