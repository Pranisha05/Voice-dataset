let isRecording = false;
let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("recordButton");
const uploadBtn = document.getElementById("submitButton");
const form = document.getElementById("voiceform");
const popSubmit = document.getElementById("popupSubmit");

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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);

        const audioPlayback = document.getElementById("audioPlayback");
        audioPlayback.src = audioURL;
        audioPlayback.style.display = "block";

        submitButton.disabled = false;
        submitButton.classList.add("enabled");
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
    startBtn.textContent = "🎙️ Start Recording";
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

  if (!provinces || !age || !district) {
    alert("Please enter all the fields.");
    return;
  }

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
    // alert("Thank you! Your voice has been uploaded.");
    popSubmit.style.display = "flex";

    form.reset();
    const audioPlayback = document.getElementById("audioPlayback");
    audioPlayback.src = "";
    audioPlayback.style.display = "none";

    uploadBtn.disabled = true;
    uploadBtn.classList.remove("enabled");
  } else {
    alert("Upload failed.");
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
