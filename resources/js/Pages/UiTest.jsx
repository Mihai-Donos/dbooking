export default function UiTest({ message, serverTime }) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            {message} ✅
          </h1>
  
          <p className="mt-2 text-sm text-slate-600">
            Server-Zeit: <span className="font-mono">{serverTime}</span>
          </p>
  
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
              Tailwind funktioniert
            </button>
  
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-100">
              Secondary
            </button>
          </div>
        </div>
      </div>
    );
  }