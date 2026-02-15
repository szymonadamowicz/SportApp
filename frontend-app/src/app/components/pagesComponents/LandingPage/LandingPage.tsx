import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLandingPageVM } from './LandingPageVM';

export default function StartingPage() {
  const vm = useLandingPageVM();
  const LogoIcon = vm.logoIcon;

  return (
    <div className="min-h-screen app-bg flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 0%, rgba(34,197,94,0.24), transparent 70%), radial-gradient(55% 55% at 15% 25%, rgba(56,189,248,0.14), transparent 65%), radial-gradient(55% 55% at 85% 35%, rgba(250,204,21,0.10), transparent 65%)',
        }}
      />
      <div className="w-full max-w-5xl text-center">
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 rounded-3xl accent-chip flex items-center justify-center">
            <LogoIcon className="w-10 h-10 text-[var(--accent)]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {vm.hero.titleTop}
          <br />
          <span className="text-gradient">{vm.hero.titleAccent}</span>
        </h1>

        <p className="text-muted text-lg mt-6 max-w-2xl mx-auto">{vm.hero.description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link href={'/login'} className="w-full sm:w-auto">
            <button className="bg-green-500 rounded-2xl w-full px-8 py-4">
              Log in
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-3 gap-6 mt-28 fade-in">
        {vm.features.map((feature, index) => (
          <div key={index} className="glass-panel card-hover p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl accent-chip flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>

            <p className="text-muted text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
