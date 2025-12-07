const NASA_API_KEY = "";
const GEMINI_API_KEY = "";

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements (already connected from HTML)
    const datePicker = document.getElementById('datePicker');
    const btnLoadApod = document.getElementById('btnLoadApod');
    const apodContent = document.getElementById('apodContent');
    const apodTitle = document.getElementById('apodTitle');
    const apodDate = document.getElementById('apodDate');
    const mediaContainer = document.getElementById('mediaContainer');
    const chatMessages = document.getElementById('chatMessages');
    const questionsContainer = document.getElementById('questionsContainer');

    let currentData = null;// add this during phase 2
 
    const rendorApod = (data) =>{  
            apodTitle.textContent = data.title;
            apodDate.textContent = data.date;
            // Reset media container
            mediaContainer.innerHTML = "";
                const img = document.createElement("img");
                img.src = data.url;
                img.alt = data.title;
                img.className = "w-full h-full object-cover rounded-lg shadow-lg";
                mediaContainer.appendChild(img);
        }
    btnLoadApod.addEventListener('click', async ()=>{
        const date = datePicker.value;

        const respone = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`);
        const data = await respone.json();
        currentData = data;// add this during phase 2
        console.log(data);
        rendorApod(data);

        console.log("Button clicked");
        apodContent.classList.remove("hidden");
        renderQuestions();
    });
   
    const predefinedQuestions = [
        "What is this object?",
        "How far away is it?",
        "Why is it special?",
        "How was it formed?"
    ];
    const renderQuestions = () => {
        questionsContainer.innerHTML = '';
        predefinedQuestions.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'text-xs bg-gray-800 hover:bg-gray-700 text-purple-200 px-3 py-2 rounded-lg border border-gray-700 hover:border-purple-600 transition flex items-center justify-center gap-2';
            btn.innerHTML = `<span class="loaderIcon hidden animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span><span class="questionText">${question}</span>`;
           
            btn.addEventListener('click', () => askQuestion(question, btn));
           
            questionsContainer.appendChild(btn);
        });
    };

    const addMessageToChat = (text, isUser = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-3';
       
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm">👤</div>
                <div class="bg-blue-900/40 rounded-lg px-4 py-2 border border-blue-700/30 ml-auto">
                    <p class="text-sm text-blue-100">${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                <div class="bg-purple-900/40 rounded-lg px-4 py-2 border border-purple-700/30 flex-1">
                    <p class="text-sm text-purple-100">${text}</p>
                </div>
            `;
        }
       
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };


    const askQuestion = async (question, button) => {
       
        if (button) {
            button.disabled = true;
            button.querySelector('.loaderIcon').classList.remove('hidden');
            button.querySelector('.questionText').classList.add('hidden');
        }

        addMessageToChat(question, true);

        const prompt = `You are a cosmic AI Assistant. The user is currently veiwing the NASA Astronomy Picture of the Day (APOD).
        The title for the imaghe is "${currentData.title}"
        Date of the image is "${currentData.date}"
        The description for the image is "${currentData.explanation}"
        Based on this information, answer the following question concisely and accurately: "${question}"
        `;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
           
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
           
            addMessageToChat(generatedText, false);

        } catch (error) {
            addMessageToChat(`Sorry, I encountered an error: ${error.message}`, false);
        } finally {
            if (button) {
                button.disabled = false;
                button.querySelector('.loaderIcon').classList.add('hidden');
                button.querySelector('.questionText').classList.remove('hidden');
            }
        }
    }
});
