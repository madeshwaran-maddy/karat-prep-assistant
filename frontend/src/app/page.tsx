"use client";

import { useRouter } from "next/navigation";

export default function RoleBasedLandingPage() {
  const router = useRouter();

  const handleCandidate = () => {
    router.push("/candidate-dashboard");
  };

  const handleReviewer = () => {
    router.push("/reviewer-dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-8">
      <div className="mx-auto max-w-[1380px] overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.10)]">

        {/* Browser-like Header 
        <div className="flex h-[54px] items-center border-b border-slate-100 px-7">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
            <span className="h-3.5 w-3.5 rounded-full bg-yellow-400" />
            <span className="h-3.5 w-3.5 rounded-full bg-green-500" />
          </div>

          <span className="ml-7 text-[18px] font-medium text-slate-600">
            Screen 2 : Role Based Landing Page
          </span>

          <div className="ml-auto h-[54px] w-5 bg-sky-500" />
        </div> */}

        {/* Main Content */}
        <section className="px-10 py-12">
          <div className="mx-auto max-w-[1190px] rounded-[22px] border border-slate-200 bg-white px-10 py-12 shadow-sm">

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-[44px] font-bold tracking-tight text-slate-900">
                Karat Preparation Assistant
              </h1>

              <h2 className="mt-2 text-[29px] font-medium text-slate-600">
                Role Based Landing Page
              </h2>

              <p className="mt-4 text-[21px] text-slate-500">
                Choose your workspace to continue
              </p>
            </div>

            {/* Role Cards */}
            <div className="mx-auto mt-12 grid max-w-[950px] grid-cols-1 gap-10 md:grid-cols-2">

              {/* Candidate Card */}
              <div className="rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-50/80 to-white px-10 py-9 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

                {/* Icon */}
                <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-green-100">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="24"
                      cy="16"
                      r="8"
                      stroke="#22A55A"
                      strokeWidth="3"
                    />
                    <path
                      d="M11 38C11 31.9249 16.3726 27 23 27H25C31.6274 27 37 31.9249 37 38"
                      stroke="#22A55A"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3 className="mt-6 text-[28px] font-bold text-slate-900">
                  For Candidate
                </h3>

                <p className="mx-auto mt-3 max-w-[300px] text-[18px] leading-7 text-slate-600">
                  Access learning modules,
                  <br />
                  practice questions,
                  <br />
                  debugging drills and
                  <br />
                  mock assessments.
                </p>

                <button
                  onClick={handleCandidate}
                  className="mt-8 w-[225px] rounded-xl bg-green-600 px-6 py-4 text-[20px] font-semibold text-white shadow-md transition hover:bg-green-700 active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>

              {/* Reviewer Card */}
              <div className="rounded-2xl border-2 border-indigo-400 bg-gradient-to-br from-indigo-50/80 to-white px-10 py-9 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

                {/* Icon */}
                <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-indigo-100">
                  <svg
                    width="52"
                    height="52"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Left person */}
                    <circle
                      cx="16"
                      cy="19"
                      r="6"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                    />

                    <path
                      d="M7 38C7 32.4772 10.5817 29 16 29C21.4183 29 25 32.4772 25 38"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    {/* Right person */}
                    <circle
                      cx="36"
                      cy="19"
                      r="6"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                    />

                    <path
                      d="M27 38C27 32.4772 30.5817 29 36 29C41.4183 29 45 32.4772 45 38"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    {/* Center person */}
                    <circle
                      cx="26"
                      cy="15"
                      r="6"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                    />

                    <path
                      d="M19 34C19 28.4772 21.6863 25 26 25C30.3137 25 33 28.4772 33 34"
                      stroke="#6366E8"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3 className="mt-6 text-[28px] font-bold text-slate-900">
                  For Leads / Reviewer
                </h3>

                <p className="mx-auto mt-3 max-w-[300px] text-[18px] leading-7 text-slate-600">
                  Search candidates,
                  <br />
                  assessment scores,
                  <br />
                  and reports.
                </p>

                <button
                  onClick={handleReviewer}
                  className="mt-8 w-[225px] rounded-xl bg-indigo-500 px-6 py-4 text-[20px] font-semibold text-white shadow-md transition hover:bg-indigo-600 active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Information Banner */}
            <div className="mx-auto mt-10 flex max-w-[910px] items-center justify-center gap-4 rounded-xl bg-sky-50 px-7 py-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[20px] font-bold text-white">
                i
              </div>

              <p className="text-[18px] text-slate-600">
                After selection, user will be redirected to the selected
                workspace.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
