/* Switch "En service / En pause" compact, intégré à la barre supérieure */
export default function DutySwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      id="duty-switch"
      role="switch"
      aria-checked={on}
      aria-label={on ? 'En service — passer en pause' : 'En pause — passer en service'}
      onClick={() => { onToggle(); navigator.vibrate?.(15); }}
      className={`flex items-center gap-2.5 h-11 pl-3 pr-1.5 rounded-full border transition-colors shrink-0 ${
        on ? 'bg-[#00ff87]/10 border-[#00ff87]/40' : 'bg-[#161616] border-white/10'
      }`}
    >
      <span className={`hidden min-[380px]:inline text-sm font-bold whitespace-nowrap ${on ? 'text-[#00ff87]' : 'text-[#b4b4b4]'}`}>
        {on ? 'En service' : 'En pause'}
      </span>
      <span className={`relative w-12 h-8 rounded-full transition-colors ${on ? 'bg-[#00ff87]' : 'bg-[#2a2a2a]'}`}>
        <span
          className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow transition-transform duration-200 ${
            on ? 'translate-x-4 bg-[#00391c]' : 'translate-x-0 bg-[#b4b4b4]'
          }`}
        />
      </span>
    </button>
  );
}
