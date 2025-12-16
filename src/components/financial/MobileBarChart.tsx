import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import { useResponsiveChart } from '../../hooks/useResponsiveChart'

interface BarChartData {
  name: string
  [key: string]: string | number
}

interface MobileBarChartProps {
  data: BarChartData[]
  dataKeys: { key: string; name: string; color: string }[]
  height?: number
  className?: string
  horizontal?: boolean // Force horizontal layout (overrides auto-detection)
}

// Abbreviate long category names for mobile
const abbreviateLabel = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) return name
  // Common abbreviations
  const abbreviations: Record<string, string> = {
    Transportation: 'Trans.',
    Entertainment: 'Entertain.',
    Insurance: 'Insur.',
    Photography: 'Photo.',
    Invitations: 'Invites',
    Clothing: 'Clothes',
    'Dining Out': 'Dining',
  }
  return abbreviations[name] || name.substring(0, maxLength - 1) + '.'
}

export function MobileBarChart({
  data,
  dataKeys,
  height,
  className = '',
  horizontal,
}: MobileBarChartProps) {
  // Use responsive chart hook for dynamic dimensions
  const { width, height: responsiveHeight, isMobile, isTablet, containerRef } = useResponsiveChart({
    mobileHeight: 300,
    tabletHeight: 350,
    desktopHeight: 400,
    minHeight: 250,
    maxHeight: 500,
  })

  // Use provided height or responsive height, ensure minimum
  const chartHeight = Math.max(250, height || responsiveHeight || 300)

  // Auto-switch to horizontal on mobile unless explicitly overridden
  const useHorizontal = horizontal !== undefined ? horizontal : isMobile

  // Don't render chart if dimensions are invalid
  if (width <= 0 || chartHeight <= 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight: '300px', minWidth: '320px' }}
      >
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight: `${chartHeight}px` }}
      >
        <p className="text-sm sm:text-base text-muted-foreground">No data to display</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 shadow-lg z-50">
          {payload.map((entry, index: number) => (
            <p key={index} className="text-xs sm:text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Prepare data with abbreviated labels for mobile
  const chartData = data.map((item) => ({
    ...item,
    displayName: isMobile ? abbreviateLabel(item.name, 10) : item.name,
  }))

  // Responsive margins
  const margins = useHorizontal
    ? { top: 5, right: 10, left: isMobile ? 70 : 80, bottom: 5 }
    : {
        top: 5,
        right: 10,
        left: isMobile ? 40 : 50,
        bottom: isMobile ? 80 : 100,
      }

  // Responsive font sizes
  const fontSize = isMobile ? '10px' : isTablet ? '11px' : '12px'
  const yAxisWidth = useHorizontal ? (isMobile ? 65 : 75) : isMobile ? 40 : 50

  // Use explicit dimensions if width is available
  const useExplicitDimensions = width > 0 && chartHeight > 0

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ 
        minWidth: '320px',
        width: '100%',
        minHeight: `${chartHeight}px`,
        height: useExplicitDimensions ? `${chartHeight}px` : 'auto'
      }}
    >
      {useExplicitDimensions ? (
        <ResponsiveContainer 
          width={width} 
          height={chartHeight}
          key={`${width}-${chartHeight}`}
        >
        <BarChart
          data={chartData}
          layout={useHorizontal ? 'vertical' : undefined}
          margin={margins}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          {useHorizontal ? (
            <>
              <XAxis
                type="number"
                tickFormatter={(value) => {
                  // Abbreviate currency on mobile
                  if (isMobile && value >= 1000) {
                    return `$${(value / 1000).toFixed(1)}k`
                  }
                  return formatCurrency(value)
                }}
                style={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
                tick={{ fontSize: parseInt(fontSize) }}
              />
              <YAxis
                type="category"
                dataKey="displayName"
                width={yAxisWidth}
                style={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
                tick={{ fontSize: parseInt(fontSize) }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="displayName"
                angle={isMobile ? -45 : -45}
                textAnchor="end"
                height={isMobile ? 80 : 100}
                style={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
                tick={{ fontSize: parseInt(fontSize) }}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => {
                  // Abbreviate currency on mobile
                  if (isMobile && value >= 1000) {
                    return `$${(value / 1000).toFixed(1)}k`
                  }
                  return formatCurrency(value)
                }}
                width={yAxisWidth}
                style={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
                tick={{ fontSize: parseInt(fontSize) }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {!isMobile && (
            <Legend
              wrapperStyle={{ fontSize }}
              iconType="square"
              formatter={(value) => <span className="text-xs sm:text-sm">{value}</span>}
            />
          )}
          {dataKeys.map((dataKey) => (
            <Bar
              key={dataKey.key}
              dataKey={dataKey.key}
              name={dataKey.name}
              fill={dataKey.color}
              radius={useHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ minHeight: `${chartHeight}px` }}>
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      )}
      {/* Show legend below chart on mobile */}
      {isMobile && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {dataKeys.map((dataKey) => (
            <div key={dataKey.key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded flex-shrink-0"
                style={{ backgroundColor: dataKey.color }}
              />
              <span className="text-xs text-muted-foreground">{dataKey.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

