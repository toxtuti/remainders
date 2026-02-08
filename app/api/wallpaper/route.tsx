import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import YearView from './year-view-enhanced';

// 안정적인 Node.js 엔진 사용
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [1] 폰트 로딩: Sniglet (귀여운 젤리 폰트)
  // ─────────────────────────────────────────────────────────────
  let fontData = null;
  try {
    const res = await fetch('https://github.com/google/fonts/raw/main/ofl/sniglet/Sniglet-Regular.ttf');
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.error('폰트 다운로드 실패');
    }
  } catch (e) {
    console.error('폰트 로딩 중 에러:', e);
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // [2] 설정: 지은님 전용 색상 및 레이아웃
    // ─────────────────────────────────────────────────────────────
    const config = {
      width: 1320,
      height: 2868,
      colors: {
        background: '#F2F2F7',  // 배경
        text: '#1C1C1E',        // 글씨
        past: '#8E8E93',        // 지난 날 (회색)
        current: '#F4900D',     // 오늘 (주황색)
        future: '#C7C7CC',      // 미래 (연회색)
      },
      layout: {
        topPadding: 0.12, bottomPadding: 0.15, sidePadding: 0.08, dotSpacing: 0.6,
      },
      typography: {
        // 폰트가 있으면 Sniglet, 없으면 기본 폰트
        fontFamily: fontData ? 'Sniglet' : 'sans-serif', 
        fontSize: 0.035,
        statsVisible: true,
      }
    };

    // ─────────────────────────────────────────────────────────────
    // [3] 날짜 계산 (한국 시간)
    // ─────────────────────────────────────────────────────────────
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const dateParts: Record<string, string> = {};
    parts.forEach(({ type, value }) => dateParts[type] = value);
    
    const currentDate = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
    );

    // ─────────────────────────────────────────────────────────────
    // [4] 화면 그리기 (외부 파일 YearView 사용)
    // ─────────────────────────────────────────────────────────────
    const calendarView = YearView({
      width: config.width,
      height: config.height,
      colors: config.colors,
      layout: config.layout,
      typography: config.typography,
      currentDate: currentDate,
      timezone: 'Asia/Seoul',
      isMondayFirst: true,
      yearViewLayout: 'months',
      daysLayoutMode: 'continuous',
      textElements: [],
      pluginElements: []
    });

    return new ImageResponse(
      (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: config.colors.background,
        }}>
          {/* 달력 본체 */}
          {calendarView}

          {/* 하단 문구 (위치: 81%) */}
          <div style={{
            position: 'absolute',
            top: '81%',
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '30px',
            fontFamily: fontData ? 'Sniglet' : 'sans-serif',
            fontWeight: 'normal', 
            color: config.colors.text,
            zIndex: 10,
          }}>
            🧡 STEP UP 🏐 TO WIN 🧡
          </div>
        </div>
      ),
      {
        width: config.width,
        height: config.height,
        // 폰트 등록
        fonts: fontData ? [
          {
            name: 'Sniglet',
            data: fontData,
            style: 'normal',
          },
        ] : undefined,
      }
    );

  } catch (error: any) {
    console.error(error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}