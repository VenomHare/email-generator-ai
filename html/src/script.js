const SERVER = "http://localhost:3000";
const inputs = document.getElementById("inputs");
const chats = document.getElementById("chats");

let chat_id = NaN;
const RANDOM_LOADING_TEXTS = ["Loading your response...","Generating your ideal email...", "Thinking....", "Loading your email...." ]

inputs.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageEle = document.getElementById("messageBox");
    const message = messageEle.value;

    messageEle.disabled = true;
    messageEle.value = RANDOM_LOADING_TEXTS[Math.floor(Math.random() * RANDOM_LOADING_TEXTS.length+1)] || "Requesting Data...";
    await sendMessage(message);
    messageEle.disabled = false;
    messageEle.value = '';
})


const sendMessage = async (message) => {
    const url = isNaN(chat_id) ? `${SERVER}/create` : `${SERVER}/chat/${chat_id}`;

    const req = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: message
        })
    })
    const data = await req.json();

    if (!req.ok) {
        alert(data.message);
        return;
    }

    if (data.id) {
        chat_id = data.id;
    }
    await refreshMessages();
}

const refreshMessages = async () => {
    const req = await fetch(`${SERVER}/messages/${chat_id}`);
    const data = await req.json();
    if (!req.ok) {
        alert(data.message);
        return;
    }

    chats.innerHTML = "";
    data.forEach(message => {
        chats.appendChild(createMessageElement(message));
    })
    
}

const createMessageElement = (message) => {
    const parent = document.createElement("div");
    parent.classList.add("chat-block");

    const authorEle = document.createElement("div");
    authorEle.classList.add("chat-author");
    authorEle.textContent = message.role == "user" ? "You" : "Email AI";
    parent.appendChild(authorEle);

    const messageEle = document.createElement("div");
    messageEle.classList.add("chat-message");
    messageEle.textContent = message.content;
    parent.appendChild(messageEle);

    message.codes?.forEach(code => {
        const codeEle = document.createElement("div");
        codeEle.classList.add("code");
        codeEle.innerHTML = code;
        parent.appendChild(codeEle);    

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy Email";
        copyBtn.addEventListener("click", () => {
            try {
                const blob = new Blob([code], { type: 'text/html' });
                const clipboardItem = new ClipboardItem({ 'text/html': blob });
                window.navigator.clipboard.write([clipboardItem]);
            }
            catch (err) {
                console.log(err);
            }
        })
        parent.appendChild(copyBtn);
    })

    return parent;
}
