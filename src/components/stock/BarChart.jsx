import React from 'react';
import Chart from 'react-apexcharts';

export default function BarChart({ data, title, color = '#3B82F6' }) {
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

  const chartSeries = [{
    name: 'Value',
    data: data.map(item => item.value)
  }];

  const chartCategories = data.map(item => item.label);

  const options = {
    chart: {
      type: 'bar',
      fontFamily: 'sans-serif',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
        distributed: false
      }
    },
    colors: [color],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '10px',
          fontFamily: 'sans-serif',
          fontWeight: 500
        },
        rotate: -45,
        rotateAlways: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#134994',
          fontSize: '10px',
          fontFamily: 'sans-serif'
        },
        formatter: (value) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toFixed(0);
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#E2E8F0',
      strokeDashArray: 3,
      padding: {
        top: 10,
        right: 5,
        bottom: 5,
        left: 5
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => {
          if (value >= 1000000) {
            return `₹${(value / 1000000).toFixed(2)}M`;
          } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(2)}K`;
          }
          return `₹${value.toFixed(2)}`;
        }
      }
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: '9px'
              }
            }
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
          type="bar"
          height={chartCategories.length > 8 ? 350 : 300}
          width="100%"
        />
      </div>
    </div>
  );
}