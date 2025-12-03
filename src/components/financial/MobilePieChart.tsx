import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/utils'
import { useResponsiveChart } from '../../hooks/useResponsiveChart'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface MobilePieChartProps {
  data: PieChartData[]
  height?: number
  className?: string
}

export function MobilePieChart({ data, height, className = '' }: MobilePieChartProps) {
  // Use responsive chart hook for dynamic dimensions
  const { width, height: responsiveHeight, isMobile, containerRef } = useResponsiveChart({
    mobileHeight: 250,
    tabletHeight: 300,
    desktopHeight: 350,
    minHeight: 200,
    maxHeight: 400,
  })

  // Use provided height or responsive height, ensure minimum
  const chartHeight = Math.max(200, height || responsiveHeight || 250)
  
  // Don't render chart if dimensions are invalid
  if (width <= 0 || chartHeight <= 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight: '250px', minWidth: '280px' }}
      >
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  // Filter out zero values
  const filteredData = data.filter((item) => item.value > 0)

  if (filteredData.length === 0) {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 shadow-lg z-50">
          <p className="text-xs sm:text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-xs sm:text-sm text-primary">{formatCurrency(data.value)}</p>
        </div>
      )
    }
    return null
  }

  // Calculate responsive outer radius
  // Smaller on mobile to prevent overflow
  const outerRadius = isMobile
    ? Math.min(chartHeight * 0.3, 80)
    : Math.min(chartHeight * 0.35, 120)

  // Hide labels on mobile (show in tooltip only)
  const showLabels = !isMobile

  // Use explicit dimensions if width is available, otherwise use ResponsiveContainer
  const useExplicitDimensions = width > 0 && chartHeight > 0

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ 
        minWidth: '280px', 
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
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
              label={
                showLabels
                  ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                  : false
              }
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center" style={{ minHeight: `${chartHeight}px` }}>
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      )}
      {/* Custom Legend - Vertical on mobile, horizontal on desktop */}
      <div
        className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} justify-center gap-2 sm:gap-3 mt-3 sm:mt-4`}
      >
        {filteredData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 ${isMobile ? 'justify-start' : 'justify-center'}`}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

