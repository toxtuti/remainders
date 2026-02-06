import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import YearView from './year-view-enhanced';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // ─────────────────────────────────────────────────────────────
  // [수정] Sour Gummy 폰트 (Regular) 불러오기
  // ─────────────────────────────────────────────────────────────
  let fontData = null;
  try {
    // Sour Gummy의 정적(Static) 파일 경로를 지정합니다.
    const res = await fetch('https://github.com/google/fonts/raw/main/ofl/sourgummy/static/SourGummy-Regular.ttf');
    
    if (res.ok) {
      fontData = await res.arrayBuffer();
    } else {
      console.error('폰트 다운로드 실패:', res.statusText);
      // 만약 static 폴더에 없다면 메인 폴더 시도 (안전장치)
      const retry = await fetch('https://github.com/google/fonts/raw/main/ofl/sourgummy/SourGummy%5Bwdth%2Cwght%5D.ttf');
      if (retry.ok) fontData = await retry.arrayBuffer();
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
        // 폰트 이름을 'SourGummy'로 설정
        fontFamily: fontData ? 'SourGummy' : 'sans-serif', 
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

    // 달력 화면 구성
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
            fontFamily: fontData ? 'SourGummy' : 'sans-serif', // 폰트 적용
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
            name: 'SourGummy',
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