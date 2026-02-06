/**
 * Final Version with Custom Text
 * 원래 디자인 + 색상 변경 + 하단 문구 추가
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
        fontFamily: 'Inter', fontSize: 0.035, statsVisible: true,
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
    // 2. 화면 구성 (달력 + 문구 합치기)
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

          {/* 2. 그 위에 문구 얹기 (위치: 82%) */}
          <div style={{
            position: 'absolute',
            top: '82%',  // 👈 요청하신 위치 (0이 위, 100이 아래일 때 82)
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center', // 가운데 정렬
            alignItems: 'center',
            fontSize: '42px',         // 글씨 크기 (적당히 키움)
            fontWeight: 'bold',
            fontFamily: 'sans-serif', // 혹은 'Inter'
            color: config.colors.text,// 글씨 색상 (진회색)
            zIndex: 10,               // 달력보다 위에 오도록
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