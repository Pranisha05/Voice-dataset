function closePopup() {
  document.getElementById("popupNotice").style.display = "none";
}
function closePopupS() {
  document.getElementById("popupSubmit").style.display = "none";
}

let lastIndex = -1; // Initialize lastIndex to -1 to avoid repetition
let sentenceData = [];

function setRandomSentence() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * sentenceData.length);
  } while (randomIndex === lastIndex);
  lastIndex = randomIndex; // Store last index to avoid repetition
  const randomSentence = sentenceData[randomIndex];
  document.getElementById("sentence").innerText = randomSentence;
}
fetch("sentence.json")
  .then((response) => response.json())
  .then((data) => {
    sentenceData = data;
    setRandomSentence();
  })
  .catch((error) => {
    console.error("Error loading sentences:", error);
    document.getElementById("sentence").innerText = "Could not load sentence.";
  });

// After recording consent and clicking Continue
document.getElementById("consentContinueBtn").addEventListener("click", () => {
  document.getElementById("popupConsent").style.display = "none";
  document.getElementById("popupNotice").style.display = "flex"; // Show instruction popup
});

let consentRecorder;
let consentChunks = [];
let isconsentRecording = false;

const startConsentBtn = document.getElementById("startConsentBtn");
const stopConsentBtn = document.getElementById("stopConsentBtn");
const consentAudio = document.getElementById("consentAudio");
const consentContinueBtn = document.getElementById("consentContinueBtn");

startConsentBtn.addEventListener("click", async () => {
  if (!isconsentRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      consentRecorder = new MediaRecorder(stream);

      consentChunks = [];

      consentAudio.src = "";
      consentAudio.style.display = "none";

      consentContinueBtn.disabled = true; // Disable continue button
      consentContinueBtn.classList.remove("enabled");

      consentRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          consentChunks.push(event.data);
        }
      };

      consentRecorder.onstop = () => {
        const consentBlob = new Blob(consentChunks, { type: "audio/mp4" });
        const consentURL = URL.createObjectURL(consentBlob);

        consentAudio.src = consentURL;
        consentAudio.style.display = "block";

        consentContinueBtn.disabled = false;
        consentContinueBtn.classList.add("enabled");
      };

      consentRecorder.start();
      startConsentBtn.textContent = "⏹️ Stop Recording";
      startConsentBtn.classList.add("recordings");
      isconsentRecording = true;
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  } else {
    consentRecorder.stop();
    startConsentBtn.textContent = "🎙️ Re-record consent";
    startConsentBtn.classList.remove("recordings");
    isconsentRecording = false;
  }
});

// After consent, show instruction popup
consentContinueBtn.addEventListener("click", () => {
  document.getElementById("popupConsent").style.display = "none";
  document.getElementById("popupInstructions").style.display = "flex";
});

// Close final popup
function closeInstructions() {
  document.getElementById("popupInstructions").style.display = "none";
}

let isRecording = false;
let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("recordButton");
const uploadBtn = document.getElementById("submitButton");
const form = document.getElementById("voiceform");
const audioPlayback = document.getElementById("audioPlayback");

startBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      audioChunks = [];

      audioPlayback.src = "";
      audioPlayback.style.display = "none";
      uploadBtn.disabled = true; // Disable submit button
      uploadBtn.classList.remove("enabled");
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp4" });
        const audioURL = URL.createObjectURL(audioBlob);

        audioPlayback.src = audioURL;
        audioPlayback.style.display = "block";

        uploadBtn.disabled = false;
        uploadBtn.classList.add("enabled");
      };

      mediaRecorder.start();
      startBtn.textContent = "⏹️ Stop Recording";
      startBtn.classList.add("recording");
      isRecording = true;
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  } else {
    mediaRecorder.stop();
    startBtn.textContent = "🎙️ Restart Recording";
    startBtn.classList.remove("recording");
    isRecording = false;
  }
});

uploadBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const consentBlob = new Blob(consentChunks, { type: "audio/wav" });

  const provinces = document.getElementById("province").value;
  const age = document.getElementById("age").value;
  const district = document.getElementById("district").value;
  const gender = document.getElementById("gender").value;

  const fields = [
    { id: "province", value: provinces },
    { id: "district", value: district },
    { id: "age", value: age },
    { id: "gender", value: gender },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    element.style.borderColor = field.value ? "" : "red"; // Set border color to red if empty
    element.style.borderWidth = field.value ? "" : "2px"; // Set border color to red if empty
  });

  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.wav");
  formData.append("consentAudio", consentBlob, "consent.wav");
  formData.append("province", document.getElementById("province").value);
  formData.append("district", document.getElementById("district").value);
  formData.append("age", document.getElementById("age").value);
  formData.append("gender", document.getElementById("gender").value);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    document.getElementById("popupSubmit").style.display = "flex";

    form.reset();
    startBtn.textContent = "🎙️ Start Recording";

    document.getElementById("province").style.borderColor = ""; // Reset border color
    document.getElementById("district").style.borderColor = "";
    document.getElementById("age").style.borderColor = "";
    document.getElementById("gender").style.borderColor = "";

    audioPlayback.src = "";
    audioPlayback.style.display = "none";

    uploadBtn.disabled = true; // Disable submit button
    uploadBtn.classList.remove("enabled");

    setRandomSentence(); // to change sentence
  } else {
    console.log("Failed to upload audio. Please try again.");
  }
});

document.getElementById("province").addEventListener("change", function () {
  const province = this.value;
  const districtSelect = document.getElementById("district");

  // Clear previous options
  districtSelect.innerHTML = '<option value="">-- Select District --</option>';

  if (provinceDistrictMap[province]) {
    provinceDistrictMap[province].forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
});

const provinceDistrictMap = {
  Koshi: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ],
  Madhesh: [
    "Bara",
    "Dhanusha",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  Bagmati: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchok",
  ],
  Gandaki: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Parbat",
    "Syangja",
    "Tanahun",
  ],
  Lumbini: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Eastern Rukum",
    "Gulmi",
    "Kapilvastu",
    "Parasi",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rupandehi",
  ],
  Karnali: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
    "Western Rukum",
  ],
  Sudurpashchim: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};
