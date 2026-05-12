import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {

  const editorRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [ users, setUsers ] = useState([])
  const [ isPlaceholderVisible, setIsPlaceholderVisible ] = useState(true)
  const [ editorMounted, setEditorMounted ] = useState(false)

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])

  const handleMount = (editor) => {
    editorRef.current = editor
    setEditorMounted(true)
  }

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  // Create provider + MonacoBinding together inside useEffect
  // so there's no race condition between provider and editor
  useEffect(() => {
    if (!username || !editorRef.current) return

    const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
      autoConnect: true,
    })

    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
      provider.awareness
    )

    provider.awareness.setLocalStateField("user", { username })

    // Update user list
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
    }
    updateUsers()
    provider.awareness.on("change", updateUsers)

    // Placeholder visibility
    const updatePlaceholder = () => {
      setIsPlaceholderVisible(yText.length === 0)
    }
    yText.observe(updatePlaceholder)
    provider.on("sync", (isSynced) => {
      if (isSynced) updatePlaceholder()
    })

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      binding.destroy()
      provider.disconnect()
      yText.unobserve(updatePlaceholder)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [ username, ydoc, yText, editorMounted ])

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    )
  }

  return (
    <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      <aside
        className="h-full w-1/4 bg-amber-50 rounded-lg"
      >
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden relative">
        {isPlaceholderVisible && (
          <div className="absolute top-[3px] left-[62px] text-gray-500 font-mono pointer-events-none z-10 text-sm select-none">
            // some comment
          </div>
        )}
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App