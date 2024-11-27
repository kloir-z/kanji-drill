import KanjiDrill from './components/KanjiDrill'

function App() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">CSVを読み込んで漢字ドリルを表示するアプリ</h1>
      <KanjiDrill />
    </main>
  )
}

export default App