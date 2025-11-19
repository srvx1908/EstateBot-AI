import React from 'react';
import { motion } from 'framer-motion';
import { Button, Form, Row, Col } from 'react-bootstrap';
import GlassCard from './GlassCard';
import Loader from './Loader';

const Chat = ({ messages, loading, query, setQuery, handleSend }) => {
  return (
    <GlassCard className="flex-grow-1 overflow-auto mb-3 p-3">
      {messages.map((msg, idx) => (
        <motion.div 
          key={idx} 
          className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
        >
          <div className={`p-3 rounded shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '85%' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        </motion.div>
      ))}

      {loading && <Loader />}

      <Form onSubmit={handleSend}>
        <Row className="g-2">
          <Col>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Ask something like: 'Analyze Wakad' or 'Compare Baner and Aundh'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              style={{ borderRadius: '25px' }}
            />
          </Col>
          <Col xs="auto">
            <Button 
              variant="primary" 
              type="submit" 
              size="lg" 
              disabled={loading}
              style={{ borderRadius: '25px', paddingLeft: '25px', paddingRight: '25px' }}
            >
              {loading ? '...' : 'Send '}
            </Button>
          </Col>
        </Row>
      </Form>
    </GlassCard>
  );
};

export default Chat;