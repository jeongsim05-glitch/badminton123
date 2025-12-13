import React, { useState } from 'react';
import { Member } from '../types';
import { ArrowRight, Search, Lock, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  members: Member[];
  onLogin: (member: Member) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ members, onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Logo Component - Haeoreum Sun Theme
  const ClubLogo = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sunGradLanding" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Sun Body with Glow */}
      <circle cx="50" cy="45" r="30" fill="url(#sunGradLanding)" filter="url(#glow)" />
      
      {/* Horizon Arc */}
      <path d="M 15 70 Q 50 55 85 70" stroke="#fcd34d" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow)" />
    </svg>
  );

  const isExecutive = (position: string) => {
    return ['회장', '부회장', '이사', '국장', '감사', '총무', '재무', '고문', '임원'].some(role => position.includes(role));
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setPassword('');
    setError('');
    
    // If not an executive and no password set, login immediately as read-only user
    if (!isExecutive(member.position) && !member.password) {
        onLogin(member);
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (selectedMember.password === password) {
        onLogin(selectedMember);
    } else {
        setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.phone.includes(searchTerm)
  );

  return (
    <div className="relative min-h-screen overflow-hidden font-sans flex flex-col items-center justify-center bg-slate-900">
      {/* Background Image with Sporty Overlay */}
      <div className="absolute inset-0 z-0 select-none">
          <img 
            src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=2070&auto=format&fit=crop" 
            alt="Badminton Net" 
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1626224583764-84786c71b221?q=80&w=2070&auto=format&fit=crop";
            }}
          />
          {/* Green/Blue Gradient Overlay for Badminton Court Feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-slate-900/80 to-blue-900/80"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white flex flex-col items-center">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
           {/* Logo Icon */}
           <div className="w-24 h-24 md:w-32 md:h-32 mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-500">
             <ClubLogo />
           </div>

           <h2 className="text-sm md:text-base font-bold text-green-300 tracking-[0.3em] uppercase mb-4">
             당신의 새로운 하루가 시작되는 곳
           </h2>
           
           <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black mb-2 tracking-tighter text-white drop-shadow-2xl italic">
             HAEOREUM
           </h1>
           <p className="text-2xl md:text-3xl font-light text-slate-300 tracking-widest uppercase mb-10">
             Badminton Club
           </p>
           
           {/* Decorative Lines */}
           <div className="flex items-center gap-2 w-32 mb-12 opacity-50">
               <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
               <div className="h-1 w-2 bg-white rounded-full"></div>
               <div className="h-1 flex-1 bg-blue-500 rounded-full"></div>
           </div>
        </div>

        {/* Enter Button */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <button 
                onClick={() => setShowLoginModal(true)}
                className="group relative inline-flex items-center gap-4 px-10 py-4 bg-white text-slate-900 rounded-full text-lg font-bold transition-all duration-300 hover:bg-green-400 hover:text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.5)]"
            >
                <span className="tracking-widest">클럽 입장하기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="absolute -bottom-32 md:-bottom-40 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mb-2">
                EST. 2025 • BORYEONG CITY
            </p>
            <p className="text-[10px] text-slate-600">
                Official Member Management System
            </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] border border-white/10">
            
            {!selectedMember ? (
                // Step 1: Select Member
                <>
                    <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
                        <h2 className="text-xl font-bold">회원 로그인</h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">본인의 이름을 검색하세요</p>
                    </div>
                    <div className="p-4 border-b bg-white">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="이름 검색 (예: 홍길동)" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-gray-50 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                        {filteredMembers.map(member => (
                            <button 
                                key={member.id}
                                onClick={() => handleMemberSelect(member)}
                                className="w-full flex items-center justify-between p-3 hover:bg-green-50 rounded-xl transition-all text-left group border border-transparent hover:border-green-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${isExecutive(member.position) ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-green-600'}`}>
                                        {member.name.slice(0,1)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-green-700">{member.name}</div>
                                        <div className="text-xs text-gray-400 group-hover:text-green-600">{member.position} • {member.rank}조</div>
                                    </div>
                                </div>
                                {isExecutive(member.position) && <Lock className="w-3 h-3 text-gray-300" />}
                            </button>
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다.</div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-center">
                        <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-800 text-xs font-bold uppercase tracking-widest transition-colors">닫기</button>
                    </div>
                </>
            ) : (
                // Step 2: Password (If Executive)
                <form onSubmit={handlePasswordLogin} className="p-8 flex flex-col items-center bg-white">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-50">
                        <Lock className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedMember.name}</h3>
                    <p className="text-xs text-blue-600 font-bold mb-8 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">관리자 인증 필요</p>
                    
                    <div className="w-full relative">
                        <input 
                            type="password" 
                            placeholder="비밀번호 입력" 
                            className="w-full text-center text-lg px-4 py-4 border-b-2 border-gray-200 focus:border-slate-800 outline-none mb-6 tracking-[0.5em] bg-transparent transition-colors placeholder:tracking-normal placeholder:text-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs mb-6 bg-red-50 px-4 py-2 rounded-full w-full justify-center">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        로그인
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        className="mt-6 text-gray-400 hover:text-gray-600 text-xs underline"
                    >
                        뒤로 가기
                    </button>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;