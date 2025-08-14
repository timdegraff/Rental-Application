// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDNZBX_O-IJnwne7JXI_pZOKZBoO-B_BM",
  authDomain: "rental-application-3d10f.firebaseapp.com",
  projectId: "rental-application-3d10f",
  storageBucket: "rental-application-3d10f.firebasestorage.app",
  messagingSenderId: "433190078343",
  appId: "1:433190078343:web:d608f2b931ea70d0dd3522",
  measurementId: "G-2R36VNZ4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const images = [
  'images/photo1.jpg', // IMG_4997.JPG - Best Overall View
  'images/photo2.jpg', // IMG_5529.JPG - Interior Highlight
  'images/photo3.jpg', // IMG_4180.jpg - Exterior View
  'images/photo4.jpg',  // IMG_6391.JPG - Additional Room/Feature
  'images/IMG_4999.JPG', 'images/IMG_5760.JPG', 'images/IMG_6388.JPG', 'images/IMG_6389.JPG',
  'images/IMG_6390.JPG', 'images/IMG_6392.JPG', 'images/IMG_6394.JPG', 'images/IMG_6395.JPG',
  'images/IMG_6400.JPG', 'images/IMG_6401.JPG', 'images/IMG_6404.JPG', 'images/IMG_6405.JPG',
  'images/IMG_7416.JPG', 'images/IMG_7418.JPG'
];

function openModal(index) {
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modalImage').src = images[index];
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

if (document.getElementById('applicationForm')) {
  signInAnonymously(auth).then(() => {
    const passcode = prompt('Enter passcode:');
    if (passcode === 'Daisy44') {
      document.getElementById('content').style.display = 'block';
      checkFormValidity(); // Initial validation
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    alert('Authentication failed: ' + error.message);
  });

  const form = document.getElementById('applicationForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('input', checkFormValidity);

  function checkFormValidity() {
    const fullName = form.fullName.value.trim();
    const dob = form.dob.value;
    const currentAddress = form.currentAddress.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const jobTitle = form.jobTitle.value.trim();
    const employer = form.employer.value.trim();
    const employmentLength = form.employmentLength.value.trim();
    const income = form.income.value.trim();
    const refNames = form.querySelectorAll('input[name="refName[]"]');
    const refPhones = form.querySelectorAll('input[name="refPhone[]"]');
    const refRelations = form.querySelectorAll('input[name="refRelation[]"]');
    const personalMessage = form.personalMessage.value.trim();

    const allRefsValid = refNames.length === 2 && 
                        Array.from(refNames).every(r => r.value.trim()) &&
                        Array.from(refPhones).every(r => r.value.trim()) &&
                        Array.from(refRelations).every(r => r.value.trim());

    submitBtn.disabled = !(fullName && dob && currentAddress && phone && email && 
                          jobTitle && employer && employmentLength && income && 
                          allRefsValid && personalMessage);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) {
      alert("Please fill all required fields.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Authentication required. Please refresh and try again.");
      return;
    }

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      data.occupants = [];
      const names = formData.getAll('occupantName[]');
      const ages = formData.getAll('occupantAge[]');
      const genders = formData.getAll('occupantGender[]');
      const relations = formData.getAll('occupantRelation[]');
      for (let i = 0; i < names.length; i++) {
        if (names[i]) data.occupants.push({ name: names[i], age: ages[i], gender: genders[i], relation: relations[i] });
      }
      data.references = [];
      const refNames = formData.getAll('refName[]');
      const refPhones = formData.getAll('refPhone[]');
      const refRelations = formData.getAll('refRelation[]');
      for (let i = 0; i < refNames.length; i++) {
        data.references.push({ name: refNames[i], phone: refPhones[i], relation: refRelations[i] });
      }
      data.submitted = new Date();

      await addDoc(collection(db, 'applications'), data);
      // Clear page and show thank-you message
      document.getElementById('content').innerHTML = `
        <header>
            <h1>Higgins Woodland Retreat - Rental Application</h1>
        </header>
        <p style="text-align: center;">Thank you for your application. We will be in touch soon!</p>
      `;
    } catch (error) {
      alert("Error submitting application: " + error.message);
    }
  });
}

if (document.getElementById('applicationsTable')) {
  signInAnonymously(auth).then
