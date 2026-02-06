import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import YearView from './year-view-enhanced';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // [핵심] 서버에 폰트 파일 다운로드 및 주입
    // ─────────────────────────────────────────────────────────────
    const fontData = await fetch(
      new URL('https://github.com/google/fonts/raw/main/ofl/notoserif/NotoSerif-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    // ─────────────────────────────────────────────────────────────
    // 1. 색상 및 설정
    // ─────────────────────────────────────────────────────────────
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
        // 👇 여기서 지정한 이름을 아래 fonts 설정과 맞춰줍니다.
        fontFamily: 'MySerif', 
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

    // ─────────────────────────────────────────────────────────────
    // 2. 화면 구성
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
          {calendarView}

          {/* 하단 문구 */}
          <div style={{
            position: 'absolute',
            top: '82%',
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '30px',
            // 👇 폰트 적용
            fontFamily: 'MySerif',
            fontWeight: 'bold', // 폰트 파일 자체가 Bold라 효과 적용됨
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
        // 👇 [중요] 폰트 파일을 여기서 실제로 등록합니다!
        fonts: [
          {
            name: 'MySerif',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );

  } catch (error: any) {
    console.error(error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}