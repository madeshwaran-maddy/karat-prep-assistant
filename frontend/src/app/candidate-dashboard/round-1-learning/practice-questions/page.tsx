import Link from "next/link";
import PracticeQuestionProvider from "./context/PracticeQuestionProvider";
import Sidebar from "./components/Sidebar";
import QuestionPanel from "./components/QuestionPanel";

export default function PracticeQuestionsPage() {
  return (
    <PracticeQuestionProvider>
      <div className="pt-6 pb-10 px-6">
        <div className="mb-3">
          <Link
            href="/candidate-dashboard/round-1-learning"
            className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
          >
            Back to Round 1 Learning
          </Link>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-5 h-[calc(100vh-3rem)] overflow-hidden">
          <Sidebar />
          <QuestionPanel />
        </div>
      </div>
    </PracticeQuestionProvider>
  );
}