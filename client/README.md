PAGE MOUNTS
     │
     ▼
wrapperRef()
creates Quill
     │
     ▼
quillReady=true
     │
     │
socket effect
connects socket
     │
     ▼
socketReady=true
     │
     ▼
Both ready?
     │
     ▼
emit("get-document")
     │
     ▼
server sends load-document
     │
     ▼
q.setContents()
     │
     ▼
editor enabled
     │
     ▼
User types
     │
     ▼
text-change event
     │
     ├── emit("send-changes")
     │
     ├── update word count
     │
     └── saveStatus="saving"
     │
     ▼
Other clients receive
receive-changes
     │
     ▼
updateContents()
     │
     ▼
Every 2 seconds
     │
     ▼
q.getContents()
     │
     ▼
emit("save-document")
     │
     ▼
Server saves database