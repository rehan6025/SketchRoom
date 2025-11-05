"use client";

import SpotlightCard from "./SpotlightCard";

export default function Features() {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            <SpotlightCard
                spotlightColor="rgba(204, 204, 255, 0.7)"
                className="bg-white"
            >
                <div className="text-center ">
                    <div className=" bg-gradient-to-br from-purple-500 to-blue-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 ">
                        <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h2 className="font-bold text-xl">Create Canvas</h2>
                    <p className="text-gray-600">
                        Start a new canvas instantly. No account required to get
                        started.
                    </p>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(204, 204, 255, 0.7)"
                className="bg-white"
            >
                <div className="text-center ">
                    <div className=" bg-gradient-to-br from-blue-500 to-orange-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 ">
                        <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h2 className="font-bold text-xl">Invite Others</h2>
                    <p className="text-gray-600">
                        Share your canvas name or id . Others can join instantly
                        from any device.
                    </p>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(204, 204, 255, 0.7)"
                className="bg-white"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Create Together
                    </h3>
                    <p className="text-gray-600">
                        Draw and create together in real-time. See
                        everyone&apos;s work live.
                    </p>
                </div>
            </SpotlightCard>
        </div>
    );
}
