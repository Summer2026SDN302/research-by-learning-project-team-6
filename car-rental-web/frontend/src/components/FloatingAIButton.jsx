import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { chatAIAPI, getAIChatHistoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FloatingAIButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await getAIChatHistoryAPI();
      const formatted = data.map(msg => ({
        role: msg.role === 'model' ? 'bot' : 'user',
        text: msg.parts
      }));
      setMessages(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await chatAIAPI({ message: userMessage });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      toast.error('AI Assistant is currently unavailable.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_8px_32px_rgba(245,158,11,0.4)] flex items-center justify-center transition-shadow hover:shadow-[0_12px_40px_rgba(245,158,11,0.6)]"
        title="LuxeRide AI Assistant"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[360px] md:w-[400px] h-[550px] bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    LuxeRide AI <Sparkles size={14} className="text-yellow-400" />
                  </h3>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow p-5 overflow-y-auto space-y-4">
              {!user ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <Bot size={40} className="text-yellow-400/40 mb-4" />
                  <h4 className="font-bold text-white text-sm mb-1">Yêu cầu đăng nhập</h4>
                  <p className="text-xs text-gray-500 mb-4">Vui lòng đăng nhập tài khoản của bạn để trò chuyện và nhận tư vấn từ Trợ lý ảo LuxeRide.</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/login');
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-2 rounded-full text-xs font-bold hover:shadow-lg transition"
                  >
                    Đăng Nhập
                  </button>
                </div>
              ) : historyLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <Bot size={36} className="text-yellow-400/60 mb-3" />
                  <p className="text-sm font-semibold text-white">Chào {user.name}!</p>
                  <p className="text-xs text-gray-400 mt-1">Tôi có thể giúp gì cho chuyến đi sang trọng tiếp theo của bạn? Hãy hỏi tôi về xe, giá cả hay chính sách đặt xe nhé!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-tr-none'
                          : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {user && (
              <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIButton;
