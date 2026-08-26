import React, { useState, useEffect } from 'react';
import API from '../api';
import { Clipboard, Check, Calendar, MessageSquare } from 'lucide-react';

export default function History() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    API.get('posts/')
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки истории:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getPlatformLabel = (platform) => {
    const labels = { 'tg': 'Telegram', 'vc': 'VC.ru', 'tw': 'Twitter / X' };
    return labels[platform] || platform;
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Загрузка истории генераций...</div>;
  if (posts.length === 0) return <div className="text-center py-12 text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">Вы еще ничего не сгенерировали. Самое время начать!</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-xl font-bold tracking-tight text-slate-200">История ваших генераций</h2>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/50 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 font-semibold rounded-md border border-cyan-500/10">
                  {getPlatformLabel(post.platform)}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${post.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : post.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {post.status === 'completed' ? 'Готово' : post.status === 'failed' ? 'Ошибка' : 'В процессе'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar size={13} /> {new Date(post.created_at).toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <MessageSquare size={13} /> Запрос: <span className="font-normal text-slate-300 italic">"{post.prompt}"</span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/30 leading-relaxed max-h-40 overflow-y-auto font-normal">
                {post.text || 'Текст отсутствует или еще генерируется...'}
              </p>
            </div>

            {post.status === 'completed' && post.text && (
              <button
                onClick={() => handleCopy(post.id, post.text)}
                className="absolute top-4 right-4 p-2 bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-xl transition cursor-pointer"
                title="Скопировать"
              >
                {copiedId === post.id ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
