let isRecording = false;
let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("recordButton");
const uploadBtn = document.getElementById("submitButton");
const form = document.getElementById("voiceform");
const audioPlayback = document.getElementById("audioPlayback");

function closePopup() {
  document.getElementById("popupNotice").style.display = "none";
}
function closePopupS() {
  document.getElementById("popupSubmit").style.display = "none";
}

startBtn.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      audioChunks = [];

      audioPlayback.src = "";
      audioPlayback.style.display = "none";

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);

        //const audioPlayback = document.getElementById("audioPlayback");
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

  const provinces = document.getElementById("province").value;
  const age = document.getElementById("age").value;
  const district = document.getElementById("district").value;

  const fields = [
    { id: "province", value: provinces },
    { id: "district", value: district },
    { id: "age", value: age },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    element.style.borderColor = field.value ? "" : "red"; // Set border color to red if empty
  });

  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.wav");
  formData.append("province", document.getElementById("province").value);
  formData.append("district", document.getElementById("district").value);
  formData.append("age", document.getElementById("age").value);

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

    //const audioPlayback = document.getElementById("audioPlayback"); // Reset audio playback
    audioPlayback.src = "";
    audioPlayback.style.display = "none";

    uploadBtn.disabled = true; // Disable submit button
    uploadBtn.classList.remove("enabled");
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
