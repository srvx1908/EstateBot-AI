import React from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import './glass.css';

const Chart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Avg Price (INR)',
        data: data.map(d => d.price),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Demand (Units Sold)',
        data: data.map(d => d.demand),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Price' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Demand' } },
    },
  };

  return (
    <motion.div 
      className="glass-card mb-4 p-2" 
      style={{ height: '300px' }} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <Line options={options} data={chartData} />
    </motion.div>
  );
};

export default Chart;