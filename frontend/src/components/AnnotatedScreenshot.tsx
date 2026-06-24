import React, { useRef, useEffect } from 'react';

export interface AnnotatedIssue {
  id: string;
  severity: string;
  title: string;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

interface Props {
  screenshotUrl: string;
  issues: AnnotatedIssue[];
  pageDimensions: { width: number; height: number };
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#da1e28',
  high:     '#ff832b',
  medium:   '#f1c21b',
  low:      '#0f62fe',
};

const MARKER_R = 16;

// A box covering ≥90% of page width at origin is a full-page fallback,
// not a real element position — skip the highlight rect for those.
function isFullPageFallback(
  box: { x: number; y: number; width: number; height: number },
  pw: number,
  ph: number
) {
  return box.x === 0 && box.y === 0 && box.width >= pw * 0.9 && box.height >= ph * 0.5;
}

const AnnotatedScreenshot: React.FC<Props> = ({
  screenshotUrl,
  issues,
  pageDimensions,
  selectedId,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId || !containerRef.current) return;
    const marker = containerRef.current.querySelector(`[data-issue-id="${selectedId}"]`);
    if (marker) marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedId]);

  const annotated = issues
    .map((issue, idx) => ({ ...issue, markerIndex: idx + 1 }))
    .filter(i => i.boundingBox !== null);

  const { width: pw, height: ph } = pageDimensions;

  // Separate precise hits from full-page fallbacks so we can position
  // fallback badges in a left-margin column instead of over the content.
  let fallbackColumn = 0;
  const positioned = annotated.map(issue => {
    const box = issue.boundingBox!;
    const fallback = isFullPageFallback(box, pw, ph);
    const colIndex = fallback ? fallbackColumn++ : 0;
    return { ...issue, fallback, colIndex };
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        overflowY: 'auto',
        maxHeight: '70vh',
        border: '1px solid #e0e0e0',
        background: '#161616',
      }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={screenshotUrl}
          alt="Full-page screenshot"
          style={{ width: '100%', display: 'block' }}
          draggable={false}
        />
        <svg
          viewBox={`0 0 ${pw} ${ph}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {positioned.map(issue => {
            const box = issue.boundingBox!;
            const color = SEVERITY_COLOR[issue.severity] ?? '#0f62fe';
            const isSelected = issue.id === selectedId;

            if (issue.fallback) {
              // No element was found — place badge in left-margin column so it
              // doesn't cover any page content and doesn't cause a full-page tint.
              const badgeX = MARKER_R + 4;
              const badgeY = MARKER_R + 4 + issue.colIndex * (MARKER_R * 2.8);
              return (
                <g
                  key={issue.id}
                  data-issue-id={issue.id}
                  onClick={() => onSelect(isSelected ? null : issue.id)}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                >
                  {isSelected && (
                    <rect
                      x={0}
                      y={0}
                      width={MARKER_R * 2 + 8}
                      height={ph}
                      fill={color}
                      fillOpacity={0.08}
                    />
                  )}
                  <circle
                    cx={badgeX}
                    cy={badgeY}
                    r={isSelected ? MARKER_R * 1.3 : MARKER_R}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.75}
                    stroke={isSelected ? 'white' : 'none'}
                    strokeWidth={isSelected ? 3 : 0}
                  />
                  <text
                    x={badgeX}
                    y={badgeY + (isSelected ? 6 : 5)}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isSelected ? MARKER_R * 1.2 : MARKER_R * 1.1}
                    fontWeight="bold"
                    fontFamily="IBM Plex Sans, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {issue.markerIndex}
                  </text>
                </g>
              );
            }

            // Precise element hit — draw the highlight rect and corner badge.
            const cx = box.x + box.width;
            const cy = box.y;
            return (
              <g
                key={issue.id}
                data-issue-id={issue.id}
                onClick={() => onSelect(isSelected ? null : issue.id)}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
              >
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={color}
                  fillOpacity={isSelected ? 0.35 : 0.12}
                  stroke={color}
                  strokeWidth={isSelected ? 6 : 2}
                  strokeDasharray={isSelected ? undefined : '10 5'}
                />
                {isSelected && (
                  <rect
                    x={box.x - 4}
                    y={box.y - 4}
                    width={box.width + 8}
                    height={box.height + 8}
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    strokeOpacity={0.6}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? MARKER_R * 1.4 : MARKER_R}
                  fill={color}
                  stroke={isSelected ? 'white' : 'none'}
                  strokeWidth={isSelected ? 3 : 0}
                />
                <text
                  x={cx}
                  y={cy + (isSelected ? 7 : 5)}
                  textAnchor="middle"
                  fill="white"
                  fontSize={isSelected ? MARKER_R * 1.3 : MARKER_R * 1.1}
                  fontWeight="bold"
                  fontFamily="IBM Plex Sans, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {issue.markerIndex}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default AnnotatedScreenshot;
