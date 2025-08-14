// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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
const storage = getStorage(app);
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

let occupantCount = 1;

function addOccupant() {
  if (occupantCount >= 6) {
    alert("Maximum 6 occupants reached.");
    return;
  }
  occupantCount++;
  const div = document.createElement('div');
  div.className = 'occupant-row';
  div.innerHTML = `
    <label>Name: <input type="text" name="occupantName[]" required autocomplete="name"></label>
    <label>Relationship: 
      <select name="occupantRelation[]" required>
        <option value="">Select</option>
        <option value="Spouse">Spouse</option>
        <option value="Child">Child</option>
        <option value="Other">Other</option>
      </select>
    </label>
    <label>Age: 
      <select name="occupantAge[]" required>
        <option value="">Select</option>
        <option value="0-12">0-12</option>
        <option value="13-17">13-17</option>
        <option value="18+">18+</option>
      </select>
    </label>
    <label>Gender: 
      <select name="occupantGender[]" required autocomplete="sex">
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </label>
  `;
  document.getElementById('occupants').appendChild(div);
}

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
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    alert('Authentication failed: ' + error.message);
  });

  document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.occupants = [];
    const names = formData.getAll('occupantName[]');
    const ages = formData.getAll('occupantAge[]');
    const genders = formData.getAll('occupantGender[]');
    const relations = formData.getAll('occupantRelation[]');
    for (let i = 0; i < names.length; i++) {
      data.occupants.push({ name: names[i], age: ages[i], gender: genders[i], relation: relations[i] });
    }
    data.references = [];
    const refNames = formData.getAll('refName[]');
    const refPhones = formData.getAll('refPhone[]');
    const refRelations = formData.getAll('refRelation[]');
    for (let i = 0; i < refNames.length; i++) {
      data.references.push({ name: refNames[i], phone: refPhones[i], relation: refRelations[i] });
    }
    data.submitted = new Date();

    let idUrl = '';
    const file = formData.get('idUpload');
    if (file && file.size <= 5000000 && file.size <= 20000000) {
      const storageRef = ref(storage, `ids/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      idUrl = await getDownloadURL(storageRef);
    }
    data.idUrl = idUrl;

    await addDoc(collection(db, 'applications'), data);
    alert('Application submitted!');
    e.target.reset();
  });
}

if (document.getElementById('applicationsTable')) {
  signInAnonymously(auth).then(() => {
    const passcode = prompt('Enter admin passcode:');
    if (passcode === 'Porky9') {
      document.getElementById('adminContent').style.display = 'block';
      onSnapshot(collection(db, 'applications'), (snapshot) => {
        const tbody = document.querySelector('#applicationsTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
          const data = doc.data();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${data.fullName}</td>
            <td>${data.income}</td>
            <td>${data.submitted.toLocaleString()}</td>
            <td><button onclick="viewDetails('${doc.id}')">View</button></td>
          `;
          tbody.appendChild(row);
        });
      });
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    alert('Authentication failed: ' + error.message);
  });
}

function viewDetails(id) {
  const docRef = doc(db, 'applications', id);
  getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      alert(JSON.stringify(docSnap.data(), null, 2));
    }
  });
}

function sortTable(n) {
  const table = document.getElementById('applicationsTable');
  let switching = true, dir = 'asc', switchcount = 0;
  while (switching) {
    switching = false;
    const rows = table.rows;
    for (let i = 1; i < (rows.length - 1); i++) {
      let shouldSwitch = false;
      const x = rows[i].getElementsByTagName('TD')[n];
      const y = rows[i + 1].getElementsByTagName('TD')[n];
      if (dir == 'asc') {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true; break;
        }
      } else if (dir == 'desc') {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true; break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == 'asc') {
        dir = 'desc'; switching = true;
      }
    }
  }
}
