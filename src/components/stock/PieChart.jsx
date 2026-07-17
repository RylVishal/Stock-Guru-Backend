import React from 'react';
import Chart from 'react-apexcharts';

export default function PieChart({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-xs text-slate-600 font-mono">
          No data available
        </div>
      </div>
    );
  }

  const chartSeries = data.map(item => item.value);
  const chartLabels = data.map(item => item.label);

  const options = {
    chart: {
      type: 'pie',
      fontFamily: 'sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels: chartLabels,
    colors: colors,
    legend: {
      position: 'bottom',
      fontFamily: 'sans-serif',
      fontSize: '11px',
      fontWeight: 500,
      labels: {
        colors: '#64748B'
      },
      markers: {
        width: 8,
        height: 8,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '0%',
          labels: {
            show: false
          }
        },
        dataLabels: {
          offset: -5
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        fontWeight: 600
      },
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val.toFixed(2)}%`
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            fontSize: '10px'
          },
          dataLabels: {
            fontSize: '9px'
          }
        }
      }
    ]
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 m-0 mb-4">{title}</h3>
      <div className="w-full">
        <Chart
          options={options}
          series={chartSeries}
          type="pie"
          height={chartLabels.length > 5 ? 300 : 280}
          width="100%"
        />
      </div>
    </div>
  );
}