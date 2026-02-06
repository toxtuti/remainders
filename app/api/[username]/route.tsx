/**
 * Username-based Wallpaper API Route (Hardcoded Version)
 * 데이터베이스 연결 없이 강제로 지은님의 설정을 적용합니다.
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
// DB 관련 임포트는 에러 방지를 위해 남겨두거나, 사용하지 않으므로 무시합니다.
import { getUserConfigByUsername, getPlugin } from '@/lib/firebase-server';
import { Plugin, UserConfig } from '@/lib/types';
import LifeView from '../wallpaper/life-view-enhanced';
import YearView from '../wallpaper/year-view-enhanced';

// Import plugins directly for server-side execution
import { quotesPlugin } from '@/lib/plugins/quotes-plugin';
import { habitTrackerPlugin } from '@/lib/plugins/habit-tracker-plugin';
import { moonPhasePlugin } from '@/lib/plugins/moon-phase-plugin';

export const runtime = 'nodejs';

/**
 * Get current date in the specified timezone
 */
function getDateInTimezone(timezone: string = 'Asia/Seoul'): Date {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const dateParts: Record<string, string> = {};
  
  parts.forEach(({ type, value }) => {
    dateParts[type] = value;
  });
  
  return new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const username = rawUsername?.toLowerCase() || 'jieun'; // 기본 유저네임

    // ─────────────────────────────────────────────────────────────
    // [지은님 전용 강제 설정 구역]
    // 데이터베이스를 무시하고 이 설정으로 무조건 그립니다.
    // ─────────────────────────────────────────────────────────────
    
    // 1. 색상 설정 (라이트 모드 + 주황색 포인트)
    const myColors = {
      background: '#FFFFFF', // 배경: 완전 흰색
      text: '#000000',       // 글씨: 검정
      current: '#F46C3F',    // 포인트: 지은님의 주황색
      past: '#8E8E93',       // 과거: 회색
      future: '#D1D1D6',     // 미래: 연한 회색
    };

    // 2. 폰트 및 스타일
    const myTypography = {
      fontFamily: 'Inter',   // 폰트: 깔끔한 Inter
      fontSize: 0.035,
      statsVisible: true,
    };

    // 3. 기기 해상도 (아이폰 고화질 기준)
    const myDevice = {
      width: 1320,
      height: 2868,
    };

    // 4. 레이아웃 (여백 조절)
    const myLayout = {
      topPadding: 0.12,    // 위쪽 여백
      bottomPadding: 0.15, // 아래쪽 여백
      sidePadding: 0.08,   // 양옆 여백
      dotSpacing: 0.6,
    };

    // 5. 핵심 설정 (생일, 뷰 모드)
    const config: any = {
      username: username,
      birthDate: '1995-01-01',    // 🎂 지은님 생년월일 (여기서 수정!)
      viewMode: 'year',           // 'year': 12달 달력 / 'life': 인생 전체 보기
      timezone: 'Asia/Seoul',     // 한국 시간
      
      // 위에서 정한 값들 적용
      colors: myColors,
      typography: myTypography,
      device: myDevice,
      layout: myLayout,
      
      // 기타 설정
      isMondayFirst: true,        // 월요일부터 시작
      yearViewLayout: 'months',   // 월별로 보기
      daysLayoutMode: 'continuous',
      textElements: [],
      plugins: [],
    };
    
    // ─────────────────────────────────────────────────────────────
    // [설정 끝] 아래는 건드리지 않아도 됩니다.
    // ─────────────────────────────────────────────────────────────

    // Get current date in user's timezone
    const userTimezone = config.timezone || 'Asia/Seoul';
    const currentDate = getDateInTimezone(userTimezone);

    // Prepare view props
    const viewProps = {
      width: config.device.width,
      height: config.device.height,
      colors: config.colors,
      typography: config.typography,
      layout: config.layout,
      textElements: config.textElements,
      pluginElements: [], // 플러그인 끔 (오류 방지)
      currentDate: currentDate,
    };

    let view;
    
    // 뷰 모드에 따라 그림 그리기
    if (config.viewMode === 'life') {
      view = LifeView({
        ...viewProps,
        birthDate: config.birthDate,
      });
    } else {
      view = YearView({
        ...viewProps,
        isMondayFirst: config.isMondayFirst || false,
        yearViewLayout: config.yearViewLayout || 'months',
        daysLayoutMode: config.daysLayoutMode || 'continuous',
        timezone: userTimezone,
      });
    }

    return new ImageResponse(view, {
      width: config.device.width,
      height: config.device.height,
    });

  } catch (error: any) {
    console.error('Error generating wallpaper:', error);
    return new Response('Internal server error: ' + error.message, { status: 500 });
  }
}