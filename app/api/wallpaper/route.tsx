/**
 * Wallpaper API Route (Node.js Version)
 * 엔진을 'nodejs'로 변경하여 고급형 뷰(색상 적용)가 정상 작동하도록 수정했습니다.
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// 고급형 뷰 가져오기
import LifeView from './life-view-enhanced';
import YearView from './year-view-enhanced';

// 👇 여기가 핵심입니다! 'edge'를 'nodejs'로 바꿨습니다.
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // [지은님 전용 설정] 소프트 라이트 모드
    // ─────────────────────────────────────────────────────────────
    const myConfig = {
      // 1. 색상 (소프트 라이트)
      colors: {
        background: '#F2F2F7', 
        text: '#1C1C1E',       
        past: '#8E8E93',       
        current: '#F4900D',    
        future: '#C7C7CC',     
      },
      // 2. 설정
      birthDate: '1995-01-01', 
      viewMode: 'year',        
      timezone: 'Asia/Seoul',
      // 3. 레이아웃
      device: { width: 1320, height: 2868 },
      typography: { fontFamily: 'Inter', fontSize: 0.035, statsVisible: true },
      layout: { topPadding: 0.12, bottomPadding: 0.15, sidePadding: 0.08, dotSpacing: 0.6 },
    };
    // ─────────────────────────────────────────────────────────────

    // 날짜 계산
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: myConfig.timezone,
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

    // 뷰 생성용 데이터
    const viewProps = {
      width: myConfig.device.width,
      height: myConfig.device.height,
      colors: myConfig.colors,
      typography: myConfig.typography,
      layout: myConfig.layout,
      textElements: [],
      pluginElements: [],
      currentDate: currentDate,
      isMondayFirst: true,
      yearViewLayout: 'months',
      daysLayoutMode: 'continuous',
      timezone: myConfig.timezone,
      birthDate: myConfig.birthDate,
    };

    let content;
    if (myConfig.viewMode === 'life') {
      content = LifeView(viewProps);
    } else {
      content = YearView(viewProps);
    }

    return new ImageResponse(
      content,
      {
        width: myConfig.device.width,
        height: myConfig.device.height,
      }
    );
  } catch (error: any) {
    console.error('Error generating wallpaper:', error);
    return new Response('Error: ' + error.message, { status: 500 });
  }
}