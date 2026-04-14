import { Dna } from 'lucide-react';

export default function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: '#050505' }}>
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(0,240,255,0.2)', animationDuration: '1.5s' }} />
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}>
            <Dna className="h-10 w-10" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-3xl tracking-widest mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</h1>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>Zero Bro-Science. Pure Biomechanics.</p>
        </div>
      </div>
    </div>
  );
}
