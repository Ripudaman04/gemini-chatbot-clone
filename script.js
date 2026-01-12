const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = document.querySelector("#file-input");
const addFileBtn = document.querySelector("#add-file-btn");
const cancelFileBtn = document.querySelector("#cancel-file-btn");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const filePreview = document.querySelector(".file-preview");
const deleteChatsBtn = document.querySelector("#delete-chats-btn");
const sendPromptBtn = document.querySelector("#send-prompt-btn");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");
const suggestions = document.querySelectorAll(".suggestions--item");

/* ❌ API KEY REMOVED FOR PUBLIC SAFETY */
// const API_KEY = "...";
// const API_URL = "...";

const userData = { message: "", file: {} };
const chatHistory = [];
let isAutoScrollEnabled = true;

container.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    isAutoScrollEnabled = scrollHeight - scrollTop - clientHeight < 50;
});

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const scrollToBottom = () => {
    if (isAutoScrollEnabled) {
        container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
    }
};

const applyTypingEffect = (text, textElement, botMsgDiv) => {
    textElement.innerHTML = "";
    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            textElement.innerHTML = marked.parse(currentText);
            textElement.querySelectorAll("pre code").forEach(block => Prism.highlightElement(block));
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            botMsgDiv.classList.remove("loading");
            addCopyButtons(textElement);
        }
    }, 40);
};

const addCopyButtons = (textElement) => {
    textElement.querySelectorAll("pre").forEach(pre => {
        const code = pre.querySelector("code");
        if (code && !pre.querySelector(".copy-code-btn")) {
            const copyBtn = document.createElement("button");
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
            copyBtn.classList.add("copy-code-btn");
            pre.appendChild(copyBtn);
            copyBtn.addEventListener("click", async () => {
                await navigator.clipboard.writeText(code.innerText);
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 2000);
            });
        }
    });
};

/* ✅ MOCK GEMINI RESPONSE */
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    try {
        // Simulated Gemini-style response
        const responseText = `
### Gemini Response (Demo)

You asked:
> **${userData.message}**

Here is a sample response showing:
- Markdown rendering
- Code blocks
- Copy button
- Typing animation

\`\`\`js
function helloWorld() {
  console.log("Hello from Gemini!");
}
\`\`\`

✅ This demo confirms full frontend functionality.
        `.trim();

        applyTypingEffect(responseText, textElement, botMsgDiv);
        chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    } catch (error) {
        textElement.innerHTML = "Error: " + error.message;
        botMsgDiv.classList.remove("loading");
    }
};

addFileBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1];
        filePreview.src = file.type === "application/pdf"
            ? "https://cdn-icons-png.flaticon.com/512/337/337946.png"
            : e.target.result;
        fileUploadWrapper.classList.add("active");
        userData.file = { data: base64String, mime_type: file.type };
    };
    reader.readAsDataURL(file);
});

cancelFileBtn.addEventListener("click", () => {
    fileInput.value = "";
    userData.file = {};
    fileUploadWrapper.classList.remove("active");
});

const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage) return;

    container.classList.add("chat-active");
    userData.message = userMessage;
    promptInput.value = "";
    isAutoScrollEnabled = true;

    const userMsgDiv = createMsgElement(`<p class="message-text">${userMessage}</p>`, "user-message");
    chatsContainer.appendChild(userMsgDiv);
    fileUploadWrapper.classList.remove("active");
    scrollToBottom();

    setTimeout(() => {
        const botMsgDiv = createMsgElement(
            `<div class="avatar-wrapper"><img src="gemini-chatbot-logo.svg" class="avatar"></div>
             <div class="message-text">Thinking...</div>`,
            "bot-message",
            "loading"
        );
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);

themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    themeToggleBtn.querySelector("i").className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
});

deleteChatsBtn.addEventListener("click", () => {
    chatsContainer.innerHTML = "";
    chatHistory.length = 0;
    container.classList.remove("chat-active");
});

suggestions.forEach(item =>
    item.addEventListener("click", () => {
        promptInput.value = item.querySelector(".text").textContent;
        handleFormSubmit();
    })
);
