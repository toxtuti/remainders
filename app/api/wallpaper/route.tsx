/**
 * Final Version: Times New Roman Style
 * 폰트: Times New Roman (전체 적용)
 * 문구 크기: 30px
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// 원래 디자인 파일 불러오기
import YearView from './year-view-enhanced'; 

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ─────────────────────────────────────────────────────────────
    // 1. 색상 및 설정
    // ─────────────────────────────────────────────────────────────
    const config = {
      width: 1320,
      height: 2868,
      
      colors: {
        background: '#F2F2F7',  // 배경
        text: '#1C1C1E',        // 글씨
        past: '#8E8E93',        // 지난 날
        current: '#F4900D',     // 오늘 (주황색)
        future: '#C7C7CC',      // 미래
      },
      
      layout: {
        topPadding: 0.12, bottomPadding: 0.15, sidePadding: 0.08, dotSpacing: 0.6,
      },
      
      typography: {
        // 👇 [수정 1] 달력 숫자 폰트를 Times New Roman으로 변경
        fontFamily: '"Times New Roman", serif', 
        fontSize: 0.035, 
        statsVisible: true,
      }
    };

    // 날짜 계산 (한국 시간)
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

    // (1) 달력 만들기
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
          backgroundColor: config.colors.background 
        }}>
          {/* 1. 배경에 달력 깔기 */}
          {calendarView}

          {/* 2. 그 위에 문구 얹기 */}
          <div style={{
            position: 'absolute',
            top: '82%',
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // 👇 [수정 2] 요청하신 대로 크기 30, 폰트 Times New Roman 적용
            fontSize: '30px',         
            fontFamily: '"Times New Roman", serif',
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
      }
    );

  } catch (error: any) {
    console.error(error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}