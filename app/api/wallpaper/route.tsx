/**
 * Original Layout with Custom Colors
 * 원래 디자인 파일(year-view-enhanced)을 사용하고 색상만 변경합니다.
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// 👇 원래 디자인 파일을 불러옵니다. (같은 폴더에 있는 파일)
import YearView from './year-view-enhanced'; 

// ⚠️ 중요: 고급형 디자인은 계산이 많아서 'nodejs' 엔진이 필요합니다.
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // [설정 구역] 여기에 원하시는 색상을 넣었습니다.
    // ─────────────────────────────────────────────────────────────
    const config = {
      // 화면 크기 (아이폰 고화질)
      width: 1320,
      height: 2868,
      
      // 🎨 지은님의 소프트 라이트 모드 색상
      colors: {
        background: '#F2F2F7',  // 배경
        text: '#1C1C1E',        // 글씨
        past: '#8E8E93',        // 지난 날
        current: '#F4900D',     // 오늘 (주황색)
        future: '#C7C7CC',      // 미래
      },
      
      // 레이아웃 설정 (원래 디자인 비율 유지)
      layout: {
        topPadding: 0.12,
        bottomPadding: 0.15,
        sidePadding: 0.08,
        dotSpacing: 0.6,
      },
      
      // 폰트 설정
      typography: {
        fontFamily: 'Inter',
        fontSize: 0.035,
        statsVisible: true,
      }
    };

    // 날짜 계산 (한국 시간 적용)
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

    // 👇 '원래 디자인 파일'에게 우리 설정값을 전달합니다.
    const viewElement = YearView({
      width: config.width,
      height: config.height,
      colors: config.colors,
      layout: config.layout,
      typography: config.typography,
      currentDate: currentDate,
      timezone: 'Asia/Seoul',
      isMondayFirst: true,          // 월요일부터 시작
      yearViewLayout: 'months',     // 월별 보기
      daysLayoutMode: 'continuous',
      textElements: [],
      pluginElements: []
    });

    return new ImageResponse(viewElement, {
      width: config.width,
      height: config.height,
    });

  } catch (error: any) {
    console.error(error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}