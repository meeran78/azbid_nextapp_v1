'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Server } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-3xl w-full text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="mb-8 inline-block"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 15, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <AlertTriangle className="w-32 h-32 text-red-400 mx-auto drop-shadow-lg" />
                </motion.div>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Server className="w-12 h-12 text-orange-400" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Critical Error
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl sm:text-2xl text-gray-200 mb-4"
            >
              A critical error occurred
            </motion.p>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              We're sorry, but something went wrong with the application. Our team has been
              notified and is working to fix the issue.
            </motion.p>

            {error.message && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-6 p-6 bg-black/40 backdrop-blur-md border border-red-500/30 rounded-lg text-left mb-8"
              >
                <p className="text-sm font-mono text-red-300 break-words mb-2">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow text-lg"
              >
                <RefreshCw className="w-6 h-6" />
                Try Again
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg font-semibold flex items-center gap-2 border border-white/20 hover:bg-white/20 transition-colors text-lg"
              >
                <Home className="w-6 h-6" />
                Go Home
              </motion.button>
            </motion.div>

            {/* Floating orbs */}
            <motion.div
              className="absolute top-10 left-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.4, 1],
                x: [0, -30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
