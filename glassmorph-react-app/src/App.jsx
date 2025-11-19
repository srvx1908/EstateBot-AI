import { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Chat from './components/Chat';
import './styles/glass.css';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const currentQuery = query;
    setQuery('');

    try {
      const res = await axios.post('http://localhost:8000/api/analyze/', { query: currentQuery });
      // Handle response data
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Container className="py-5 glass-background" style={{ maxWidth: '900px' }}>
      <motion.h2 
        className="text-center mb-4 fw-bold text-white" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
      >
        🏠 Real Estate Analytics Chatbot
      </motion.h2>
      
      <motion.div 
        className="glass-card shadow-lg" 
        initial={{ scale: 0.9 }} 
        animate={{ scale: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <Chat loading={loading} handleSend={handleSend} query={query} setQuery={setQuery} />
      </motion.div>
    </Container>
  );
}

export default App;