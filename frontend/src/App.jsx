import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, TextField, IconButton, Paper, Typography, 
  AppBar, Toolbar, Avatar, CircularProgress, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, useMediaQuery, useTheme
} from '@mui/material';
import { 
  Send as SendIcon, 
  SmartToy as BotIcon, 
  Download as DownloadIcon, 
  ShowChart as ChartIcon 
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from "framer-motion"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- FIXED: Moved RenderChart OUTSIDE the main App function ---
// This prevents it from re-rendering on every keystroke
const RenderChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Price (₹)',
        data: data.map(d => d.price),
        borderColor: '#64b5f6', 
        backgroundColor: 'rgba(100, 181, 246, 0.2)',
        yAxisID: 'y',
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Demand',
        data: data.map(d => d.demand),
        borderColor: '#ffb74d',
        backgroundColor: 'rgba(255, 183, 77, 0.2)',
        yAxisID: 'y1',
        tension: 0.4
      }
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'white' } } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } },
      y: { type: 'linear', display: true, position: 'left', ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y1: { type: 'linear', display: true, position: 'right', ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } },
    },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ 
        p: 2, mt: 2, height: 280, borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ height: '100%' }}><Line options={options} data={chartData} /></Box>
      </Paper>
    </motion.div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Estate Agent. Ask me to "Analyze Wakad" or "Compare areas".' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const downloadCSV = (data) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'real_estate_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setLoading(true);
    const currentQuery = query;
    setQuery('');

    try {
      const res = await axios.post('http://localhost:8000/api/analyze/', { query: currentQuery });
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: res.data.summary,
        chartData: res.data.chart_data,
        tableData: res.data.table_data
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Connection Error: Is the backend running?' }]);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white', overflow: 'hidden'
    }}>
      
      {/* HEADER */}
      <AppBar position="static" elevation={0} sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.8)', mr: 2 }}><BotIcon /></Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 0.5 }}>
            EstateBot AI
          </Typography>
        </Toolbar>
      </AppBar>

      {/* CHAT AREA */}
      <Box sx={{ 
        flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2,
        scrollBehavior: 'smooth'
      }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '90%' : '70%' }}
            >
              {/* Message Bubble */}
              <Paper elevation={4} sx={{ 
                p: 2, borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: msg.sender === 'bot' ? 'blur(10px)' : 'none',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
              </Paper>

              {/* Chart with strict length check */}
              {msg.chartData && msg.chartData.length > 0 && <RenderChart data={msg.chartData} />}
              
              {/* Table with strict length check */}
              {msg.tableData && msg.tableData.length > 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Paper sx={{ 
                      mt: 2, borderRadius: 3, overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Data Preview</Typography>
                        <Button size="small" startIcon={<DownloadIcon />} onClick={() => downloadCSV(msg.tableData)} sx={{ color: '#64b5f6' }}>CSV</Button>
                      </Box>
                      <TableContainer sx={{ maxHeight: 200 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              {['Loc', 'Year', 'Price', 'Sold'].map(h => (
                                <TableCell key={h} sx={{ bgcolor: '#1e293b', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {msg.tableData.slice(0, 10).map((row, i) => (
                              <TableRow key={i} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05) !important' } }}>
                                <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{row['final location']}</TableCell>
                                <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{row['year']}</TableCell>
                                <TableCell sx={{ color: '#64b5f6', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>₹{(row['flat - weighted average rate']/1000).toFixed(1)}k</TableCell>
                                <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{row['total sold - igr']}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                 </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, opacity: 0.7 }}>
             <CircularProgress size={20} sx={{ color: '#6366f1', mr: 1 }} /> 
             <Typography variant="caption" color="white">AI is analyzing market data...</Typography>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>

      {/* INPUT AREA */}
      <Paper elevation={0} sx={{ 
        p: 2, background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(20px)', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', maxWidth: '800px', margin: '0 auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            size="small"
            sx={{ 
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': { 
                borderRadius: '30px', 
                bgcolor: 'rgba(0,0,0,0.2)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' }
              }
            }}
          />
          <IconButton 
            type="submit" 
            disabled={loading || !query.trim()}
            sx={{ 
              bgcolor: '#6366f1', color: 'white', 
              '&:hover': { bgcolor: '#4f46e5' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
            }}
          >
            <SendIcon />
          </IconButton>
        </form>
      </Paper>
    </Box>
  );
}

export default App;