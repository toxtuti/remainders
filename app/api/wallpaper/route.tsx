import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import YearView from './year-view-enhanced';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [폰트] Sniglet (귀여운 젤리 폰트)
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
    console.error('폰트 로딩 중 에러 발생:', e);
  }

  try {
    const config = {
      width: 1320,
      height: 2868,
      colors: {
        background: '#F2F2F7',
        text: '#1C1C1E',
        past: '#8E8E93',
        current: '#F4900D',
        future: '#C7C7CC',
      },
      layout: {
        topPadding: 0.12, bottomPadding: 0.15, sidePadding: 0.08, dotSpacing: 0.6,
      },
      typography: {
        fontFamily: fontData ? 'Sniglet' : 'sans-serif', 
        fontSize: 0.035,
        statsVisible: true,
      }
    };

    // 날짜 계산
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
          {calendarView}

          {/* 하단 문구 */}
          <div style={{
            position: 'absolute',
            // 👇 [수정] 82% -> 81%로 위치 상향 조정
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