import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import YearView from './year-view-enhanced';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [안전장치 1] 폰트 파일 불러오기 (실패하면 기본 폰트 사용)
  // ─────────────────────────────────────────────────────────────
  let fontData = null;
  try {
    // Times New Roman과 거의 똑같은 구글 무료 폰트 'Tinos'를 가져옵니다.
    const res = await fetch('https://github.com/google/fonts/raw/main/apache/tinos/Tinos-Bold.ttf');
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.error('폰트 다운로드 실패:', res.statusText);
    }
  } catch (e) {
    console.error('폰트 로딩 중 에러 발생 (기본 폰트로 대체합니다):', e);
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // [설정] 색상 및 디자인
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
        // 폰트가 있으면 'MySerif'를 쓰고, 없으면 시스템 기본 명조체(serif)를 씁니다.
        fontFamily: fontData ? 'MySerif' : 'serif', 
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
    // [화면 구성]
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
            fontFamily: fontData ? 'MySerif' : 'serif', // 폰트 적용
            fontWeight: 'bold',
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
        // 폰트가 성공적으로 로드되었을 때만 등록합니다. (오류 방지)
        fonts: fontData ? [
          {
            name: 'MySerif',
            data: fontData,
            style: 'normal',
          },
        ] : undefined,
      }
    );

  } catch (error: any) {
    console.error(error);
    // 최악의 경우에도 500 에러 대신 에러 메시지를 그림으로 보여줍니다.
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}