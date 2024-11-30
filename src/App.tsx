import { useState } from 'react'
import KanjiDrill from './components/KanjiDrill'
import { HelpModal } from './components/HelpModal'

function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold">指定形式のCSVファイルから漢字ドリルを作成するアプリ</h1>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100"
          aria-label="ヘルプを開く"
        >
          ?
        </button>
      </div>
      <KanjiDrill />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </main>
  )
}

export default App