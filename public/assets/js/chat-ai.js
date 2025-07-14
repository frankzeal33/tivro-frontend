
// Define chat responses
const chatResponses = {
        "1": [
            { type: "user", text: "Kindly help me find a 2-bedroom apartment in Lagos under ₦500k/year?" },
            { type: "bot", text: "Hi there!" },
            { type: "bot", text: "Thanks for reaching out. Let's help you find a 2-bedroom apartment in Lagos within your budget." },
            { type: "bot", text: "Found a 2-bedroom flat in Ikeja, Lagos – ₦450k/year. Would you like more details? 😊" },
            { type: "user", text: "Yes, please." },
        ],
        "2": [
            { type: "user", text: "What documents do I need to rent a house in Nigeria?" },
            { type: "bot", text: "Hello! I'll help you with that." },
            { type: "bot", text: "To rent a house in Nigeria, you typically need:" },
            { type: "bot", text: "1. Valid ID (National ID, Passport, or Driver's License)\n2. Proof of Income/Employment\n3. Bank Statements\n4. Reference Letters\n5. Passport Photographs" }
        ],
        "3": [
            { type: "user", text: "Are there housing laws I should know about in Lagos?" },
            { type: "bot", text: "Welcome! I'll explain the key housing laws." },
            { type: "bot", text: "Lagos has several important housing regulations you should know about." },
            { type: "bot", text: "These include rent control laws, tenancy agreements, and landlord-tenant rights. Would you like me to explain each in detail?" }
        ]
    };

    function createChatBubble(message) {
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `d-flex justify-content-${message.type === 'user' ? 'end' : 'start'} mb-3 chat-bubble`;

        const innerDiv = document.createElement('div');
        innerDiv.className = message.type === 'user' ? 'chat-bubble-user p-2 rounded-3' : 'bg-light p-2 rounded-3';
        innerDiv.style.maxWidth = '80%';
        innerDiv.textContent = message.text;

        bubbleDiv.appendChild(innerDiv);
        return bubbleDiv;
    }

    function animateChatSequence(chatId) {
        // Remove active class from all prompts
        document.querySelectorAll('.clickable-prompt').forEach(prompt => {
            prompt.classList.remove('active');
        });

        // Add active class to clicked prompt
        document.querySelector(`[data-chat="${chatId}"]`).classList.add('active');

        // Clear existing chat content
        const desktopChat = document.getElementById('chatContent');
        const mobileChat = document.getElementById('mobileChatContent');
        desktopChat.innerHTML = '';
        mobileChat.innerHTML = '';

        const messages = chatResponses[chatId];
        let delay = 0;

        messages.forEach((message, index) => {
            setTimeout(() => {
                // Create and append bubbles for both desktop and mobile
                const desktopBubble = createChatBubble(message);
                const mobileBubble = createChatBubble(message);

                desktopChat.appendChild(desktopBubble);
                mobileChat.appendChild(mobileBubble);

                // Trigger animation
                setTimeout(() => {
                    desktopBubble.classList.add('show');
                    mobileBubble.classList.add('show');
                }, 50);
            }, delay);

            delay += 1000; // Add 1 second delay between each message
        });
    }

    // Add click event listeners to prompts
    document.querySelectorAll('.clickable-prompt').forEach(prompt => {
        prompt.addEventListener('click', () => {
            animateChatSequence(prompt.dataset.chat);
        });
    });

    // Show first chat by default when page loads
    document.addEventListener('DOMContentLoaded', () => {
        animateChatSequence('1');
    });
