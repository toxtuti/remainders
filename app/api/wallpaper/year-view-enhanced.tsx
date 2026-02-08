/**
 * Year View Component - Jieun's Custom Version
 * 살구색, 파랑색, 보라색 기념일을 직접 그립니다.
 */

import { TextElement } from '@/lib/types';
import {
  calculateDaysLeftInYear,
  getCurrentDayOfYear,
  getTotalDaysInCurrentYear,
} from '@/lib/calcs';

interface YearViewProps {
  width: number;
  height: number;
  isMondayFirst: boolean;
  yearViewLayout?: 'months' | 'days';
  daysLayoutMode?: 'calendar' | 'continuous';
  colors?: {
    background: string;
    past: string;
    current: string;
    future: string;
    text: string;
  };
  typography?: {
    fontFamily: string;
    fontSize: number;
    statsVisible: boolean;
  };
  layout?: {
    topPadding: number;
    bottomPadding: number;
    sidePadding: number;
    dotSpacing: number;
  };
  textElements?: TextElement[];
  pluginElements?: any[];
  currentDate?: Date;
  timezone?: string;
}

export default function YearView({
  width,
  height,
  isMondayFirst,
  yearViewLayout = 'months',
  daysLayoutMode = 'continuous',
  colors = {
    background: '#1a1a1a',
    past: '#FFFFFF',
    current: '#FF6B35',
    future: '#404040',
    text: '#888888',
  },
  typography = {
    fontFamily: 'monospace',
    fontSize: 0.035,
    statsVisible: true,
  },
  layout = {
    topPadding: 0.25,
    bottomPadding: 0.15,
    sidePadding: 0.18,
    dotSpacing: 0.7,
  },
  textElements = [],
  pluginElements = [],
  currentDate = new Date(),
  timezone = 'UTC',
}: YearViewProps) {
  
  // ─────────────────────────────────────────────────────────────
  // [1] 여기에 지은님의 특별한 날짜들을 입력했습니다!
  // ─────────────────────────────────────────────────────────────
  const SPECIAL_DATES: Record<string, string> = {
    // 🧡 살구색 (#fb9b82)
    '2026-01-04': '#fb9b82',
    '2026-01-09': '#fb9b82',
    '2026-03-27': '#fb9b82',
    '2026-05-22': '#fb9b82',
    '2026-11-19': '#fb9b82',

    // 💙 진한 파랑 (#00498c)
    '2026-03-28': '#00498c',
    '2026-10-31': '#00498c',

    // 💜 연한 보라 (#C4BFE3)
    '2026-03-26': '#C4BFE3',
  };

  // ─────────────────────────────────────────────────────────────
  // 기본 날짜 계산 로직
  // ─────────────────────────────────────────────────────────────
  const date = currentDate;
  const currentYear = date.getFullYear();
  const currentDayOfYear = getCurrentDayOfYear(timezone);
  const daysLeft = calculateDaysLeftInYear(timezone);
  const totalDays = getTotalDaysInCurrentYear();

  // (Days View 로직은 생략하고, 바로 아래 Months View로 넘어갑니다)
  // 지은님은 달력형(Months)을 쓰시니까요!

  // Grid Layout Config (Months View)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const COLUMNS = 3;
  const ROWS = 4;

  const aspectRatio = height / width;
  
  const SAFE_AREA_TOP = aspectRatio > 2.0 
    ? height * Math.max(layout.topPadding, 0.28) 
    : height * layout.topPadding;
  const SAFE_AREA_BOTTOM = height * layout.bottomPadding;
  const SAFE_HEIGHT = height - SAFE_AREA_TOP - SAFE_AREA_BOTTOM;

  const adjustedSidePadding = aspectRatio > 2.1 
    ? Math.min(layout.sidePadding, 0.12) 
    : aspectRatio > 2.0 
    ? Math.min(layout.sidePadding, 0.15) 
    : layout.sidePadding;
  
  const paddingX = width * adjustedSidePadding;
  const availableWidth = width - paddingX * 2;
  const cellWidth = availableWidth / COLUMNS;

  const maxDotSizeH = cellWidth / 8; 
  const maxMonthBlockHeight = SAFE_HEIGHT / ROWS;
  const maxDotSizeV = maxMonthBlockHeight / 9; 
  
  const dotSize = Math.min(maxDotSizeH, maxDotSizeV, cellWidth / 7, 20);
  const dotGap = dotSize * layout.dotSpacing;
  const monthLabelSize = dotSize * 1.6;

  const monthBlockHeight = monthLabelSize + dotSize + 6 * dotSize + 5 * dotGap;
  const rowGap = monthLabelSize * 1.0;

  const statsFontSize = monthLabelSize;
  const statsMargin = rowGap * 3.0; 

  const gridHeight = ROWS * monthBlockHeight + (ROWS - 1) * rowGap;
  const totalContentHeight = gridHeight + statsMargin + statsFontSize;

  const calculatedStartY = SAFE_AREA_TOP + (SAFE_HEIGHT - totalContentHeight) / 2;
  const startY = Math.max(SAFE_AREA_TOP * 0.9, calculatedStartY);
  const statsY = startY + gridHeight + statsMargin;

  const getDaysInMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, monthIndex: number) => {
    if (isMondayFirst) {
      const day = new Date(year, monthIndex, 1).getDay();
      return day === 0 ? 6 : day - 1;
    }
    return new Date(year, monthIndex, 1).getDay();
  };

  let globalDayCounter = 0;

  // ─────────────────────────────────────────────────────────────
  // [2] 여기서 달력을 그립니다!
  // ─────────────────────────────────────────────────────────────
  const monthCells = MONTHS.map((monthName, monthIndex) => {
    const daysInMonth = getDaysInMonth(currentYear, monthIndex);
    const startDay = getFirstDayOfMonth(currentYear, monthIndex);

    const dots = [];

    // 42칸 (7일 * 6주) 그리드 채우기
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1;
      let color = 'transparent';

      if (dayNum > 0 && dayNum <= daysInMonth) {
        globalDayCounter++;
        
        // 날짜 키 생성 (예: '2026-03-27')
        const dateKey = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

        // 🎨 색상 결정 로직 (여기가 핵심!)
        if (globalDayCounter < currentDayOfYear) {
          // 1. 과거면 무조건 회색
          color = colors.past;
        } else if (globalDayCounter === currentDayOfYear) {
          // 2. 오늘이면 무조건 주황색 (colors.current)
          color = colors.current;
        } else {
          // 3. 미래일 때만 기념일 체크!
          if (SPECIAL_DATES[dateKey]) {
            color = SPECIAL_DATES[dateKey]; // ✨ 지정한 색상!
          } else {
            color = colors.future; // 없으면 기본 미래색
          }
        }
      }

      if (dayNum > 0 && dayNum <= daysInMonth) {
        const row = Math.floor(i / 7);
        const col = i % 7;

        dots.push(
          <div
            key={`dot-${monthIndex}-${i}`}
            style={{
              position: 'absolute',
              left: `${col * (dotSize + dotGap)}px`,
              top: `${row * (dotSize + dotGap)}px`,
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        );
      }
    }

    // 월 배치
    const colIndex = monthIndex % COLUMNS;
    const rowIndex = Math.floor(monthIndex / COLUMNS);

    const x = paddingX + colIndex * cellWidth;
    const y = startY + rowIndex * (monthBlockHeight + rowGap);
    
    const dotGridWidth = (7 * dotSize) + (6 * dotGap);
    const centerOffset = Math.max(0, (cellWidth - dotGridWidth) / 2);

    return (
      <div
        key={monthName}
        style={{
          position: 'absolute',
          left: `${x + centerOffset}px`,
          top: `${y}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            color: colors?.text || '#888888',
            fontSize: `${monthLabelSize}px`,
            marginBottom: `${dotSize}px`,
            fontFamily: typography?.fontFamily || 'monospace',
            display: 'flex',
          }}
        >
          {monthName}
        </div>
        <div
          style={{
            position: 'relative',
            width: `${7 * (dotSize + dotGap)}px`,
            height: `${6 * (dotSize + dotGap)}px`,
            display: 'flex',
          }}
        >
          {dots}
        </div>
      </div>
    );
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: colors?.background || '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%' }}>
        {monthCells}
      </div>

      {/* 하단 통계 (몇 일 남았는지) */}
      {typography.statsVisible && (
        <div
          style={{
            position: 'absolute',
            top: `${statsY}px`,
            left: '0px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: `${statsFontSize}px`,
            fontFamily: typography?.fontFamily || 'monospace',
          }}
        >
          <span style={{ color: colors?.current || '#FF6B35' }}>{daysLeft}d left</span>
          <span style={{ color: colors?.text || '#888888', margin: '0px 8px' }}>·</span>
          <span style={{ color: colors?.text || '#888888' }}>{Math.round((currentDayOfYear / totalDays) * 100)}%</span>
        </div>
      )}

      {/* 추가 텍스트 요소들 (플러그인) */}
      {textElements.map((element) => {
        if (!element.visible || element.content == null) return null;
        // ... (기존 코드 유지)
        return null; // (간략화)
      })}
    </div>
  );
}