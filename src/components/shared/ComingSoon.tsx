import { CogIcon, WrenchScrewdriverIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const MaintenanceMode = () => {
    return (
        <div className="flex items-center justify-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl w-full text-center ">
                <div className="flex justify-center mb-8">
                    <div className="relative p-4 bg-sky-100/50 rounded-2xl border border-sky-200/60">
                        <CogIcon className="w-20 h-20 text-main animate-spin [animation-duration:12s]" />
                        <WrenchScrewdriverIcon className="w-8 h-8 text-main absolute bottom-2 right-2 bg-white rounded-lg p-1 shadow-sm" />
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-4  text-xs sm:text-sm font-semibold tracking-wider text-main uppercase bg-sky-100 border border-sky-200 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-main animate-pulse"></span>
                    Under Construction
                </span>

                <h1 className="mt-8 text-4xl sm:text-5xl font-black text-main tracking-tight leading-none">
                    Coming Soon..!!
                </h1>

                <p className="mt-6 text-base sm:text-lg text-main/70 max-w-lg mx-auto font-medium leading-relaxed">
                    We are currently working hard behind the scenes to upgrade our platform. A brand new experience is just around the corner.
                </p>

                <form onSubmit={(e) => e.preventDefault()} className="mt-10 max-w-md mx-auto hidden">
                    <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-sky-50/50 border border-sky-100 rounded-2xl backdrop-blur-sm">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-main/40" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-sky-200/60 rounded-xl text-main placeholder-main/40 focus:outline-none focus:ring-2 focus:ring-main focus:border-main text-base shadow-sm transition-all duration-200"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-3 bg-main text-white font-semibold text-base rounded-xl transition-all duration-200 hover:opacity-95 active:scale-[0.98] whitespace-nowrap shadow-md shadow-main/10"
                        >
                            Notify Me
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default MaintenanceMode;