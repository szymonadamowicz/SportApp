import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingPageVM } from "./LandingPageVM";

export default function StartingPage() {
  const vm = useLandingPageVM();
  const LogoIcon = vm.logoIcon;

  return (
    <div className="rf-page-radial relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-[calc(3rem+env(safe-area-inset-top))] sm:px-6 md:py-24">
      <div className="w-full max-w-5xl text-center">
        <div className="mb-8 flex justify-center md:mb-10">
          <div className="accent-chip flex h-16 w-16 items-center justify-center rounded-3xl sm:h-20 sm:w-20">
            <LogoIcon className="h-8 w-8 text-[var(--accent)] sm:h-10 sm:w-10" />
          </div>
        </div>

        <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {vm.hero.titleTop}
          <br />
          <span className="text-gradient">{vm.hero.titleAccent}</span>
        </h1>

        <p className="text-muted mx-auto mt-5 max-w-2xl text-base sm:text-lg md:mt-6">
          {vm.hero.description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:mt-10">
          <Link href={"/login"} className="w-full sm:w-auto">
            <button className="group rf-btn-primary min-h-12 w-full cursor-pointer rounded-2xl px-8 py-4 font-semibold active:scale-95">
              Log in
              <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      <div className="fade-in mt-12 grid w-full max-w-6xl gap-5 md:mt-28 md:grid-cols-3 md:gap-6">
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
