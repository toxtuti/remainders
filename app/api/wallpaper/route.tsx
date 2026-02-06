/**
 * Wallpaper API Route (Customized for Jieun)
 * 지은님의 소프트 라이트 모드 색상을 강제로 적용합니다.
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// 고급형 뷰(Enhanced)를 가져와서 색상을 입힙니다.
import LifeView from './life-view-enhanced';
import YearView from './year-view-enhanced';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // [지은님 전용 색상 설정]
    // 방금 주신 코드를 그대로 넣었습니다.
    // ─────────────────────────────────────────────────────────────
    
    const myConfig = {
      // 1. 색상 (소프트 라이트 모드)
      colors: {
        background: '#F2F2F7', // 배경 (연회색)
        text: '#1C1C1E',       // 텍스트 (진회색)
        past: '#8E8E93',       // 과거 날짜 (중간 회색)
        current: '#F4900D',    // 현재 날짜 (진한 주황)
        future: '#C7C7CC',     // 미래 날짜 (연한 회색)
      },

      // 2. 기본 정보 (생일은 1995-01-01로 설정됨)
      birthDate: '1995-01-01', 
      viewMode: 'year',        // 12달 달력 (인생 보기 원하면 'life'로 변경)
      timezone: 'Asia/Seoul',  // 한국 시간
      
      // 3. 레이아웃 & 폰트
      device: { width: 1320, height: 2868 },
      typography: { fontFamily: 'Inter', fontSize: 0.035, statsVisible: true },
      layout: { topPadding: 0.12, bottomPadding: 0.15, sidePadding: 0.08, dotSpacing: 0.6 },
    };
    // ─────────────────────────────────────────────────────────────

    // 한국 시간 계산
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

    // 고급형 뷰에 넣을 재료 준비
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