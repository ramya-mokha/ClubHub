import React from "react";
import ButtonOutline from "../../shared/button1";
import ButtonBg from "../../shared/button2";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/src/assets/landingPage.png')]
        bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-white/50" />

      {/* Content */}
      <div
        className="relative z-10 max-w-6xl mx-auto px-6 
        min-h-screen flex flex-col justify-center text-center"
      >
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          Discover, register, and manage campus events
        </h1>

        <p className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto">
          One platform to explore college events, manage clubs, and stay
          connected with everything happening on campus.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonOutline text="Manage your club" url="/signup2" />
          <ButtonBg text="Explore events" url="/signup2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
