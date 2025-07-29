import React from 'react';
import { useTitle } from '../hooks/useTitle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  useTitle('404 | Page Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-6xl font-extrabold text-blue-700 mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          404
        </motion.h1>
        <p className="text-gray-600 text-lg mb-6">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
        >
          ← Go Back Home
        </motion.button>
      </motion.div>
    </div>
  );
};
