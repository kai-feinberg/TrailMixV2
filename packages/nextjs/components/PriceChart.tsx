"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
// const priceData = [
//     [1622505600, 35000],
//     [1622592000, 36000],
//     [1622678400, 37000],
//     [1622764800, 38000],
//     [1622851200, 39000],
//     // Add more data points as needed
//   ];

//   // Format the data
//   const chartData = priceData.map(([timestamp, price]) => ({
//     timestamp: new Date(timestamp * 1000).toLocaleDateString(),
//     price,
//   }));


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PriceChart({ priceData }: { priceData: [number, number][] }) {
  // Format the data
  if (!priceData) {
    return <div>Loading...</div>; // or handle loading/error state appropriately
  }

  const chartData = priceData.map(([timestamp, price]: [number, number]) => ({
    timestamp: new Date(timestamp).toLocaleDateString(),
    price,
  }));

  // console.log("chart data", chartData)

  return (

    <div className="aspect-[16/9] mb-2 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 8,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 4)}
              tick={false}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="price"
              type="monotone"
              stroke="gold"
              strokeWidth={2}
              dot={false}
            />
            {/* <Line
                  dataKey="mobile"
                  type="monotone"
                  stroke="red"
                  strokeWidth={2}
                  dot={false}
                /> */}
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>

  )
}
