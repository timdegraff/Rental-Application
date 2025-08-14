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
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modalImage');
  if (modal && modalImage) {
    modal.style.display = 'block';
    modalImage.src = images[index] || '';
  } else {
    console.error('Modal or modal image not found');
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function addOccupant() {
  console.log('Adding occupant...');
  const occupantsDiv = document.getElementById('occupants');
  if (!occupantsDiv) {
    console.error('Occupants div not found');
    return;
  }
  let occupantCount = occupantsDiv.children.length + 1;
  if (occupantCount > 6) {
    alert("Maximum 6 occupants reached.");
    return;
  }
  const div = document.createElement('div');
  div.className = 'occupant-row';
  div.innerHTML = `
    <label>Name: <input type="text" name="occupantName[]" required autocomplete="name"></label>
    <label>Relationship: 
      <select name="occupantRelation[]" required>
        <option value="">Select</option>
        <option value="Self">Self</option>
        <option value="Spouse">Spouse</option>
        <option value="Child">Child</option>
        <option value="Parent">Parent</option>
        <option value="Other">Other</option>
      </select>
    </label>
    <label>Age: <input type="text" name="occupantAge[]" required></label>
    <label>Gender: 
      <select name="occupantGender[]" required autocomplete="sex">
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </label>
    ${occupantCount > 1 ? '<button type="button" class="delete-occupant" onclick="deleteOccupant(this)">X</button>' : ''}
  `;
  occupantsDiv.appendChild(div);
  console.log('Occupant added, count:', occupantCount);
}

function deleteOccupant(button) {
  const occupantsDiv = document.getElementById('occupants');
  if (occupantsDiv && occupantsDiv.children.length > 1) {
    button.parentElement.remove();
    console.log('Occupant deleted, remaining:', occupantsDiv.children.length);
  }
}

function checkFormValidity(form) {
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

  return fullName && dob && currentAddress && phone && email && 
         jobTitle && employer && employmentLength && income && 
         allRefsValid && personalMessage;
}

if (document.getElementById('applicationForm')) {
  signInAnonymously(auth).then(() => {
    const passcode = prompt('Enter passcode:');
    if (passcode === 'Daisy44') {
      document.getElementById('content').style.display = 'block';
      const form = document.getElementById('applicationForm');
      const submitBtn = document.getElementById('submitBtn');
      const addOccupantBtn = document.getElementById('addOccupantBtn');
      if (form && submitBtn && addOccupantBtn) {
        submitBtn.disabled = !checkFormValidity(form);
        addOccupantBtn.addEventListener('click', addOccupant);
      } else {
        console.error('Form, submit button, or add occupant button not found');
      }
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    console.error('Authentication error:', error);
    alert('Authentication failed: ' + error.message);
  });

  const form = document.getElementById('applicationForm');
  const submitBtn = document.getElementById('submitBtn');
  const addOccupantBtn = document.getElementById('addOccupantBtn');

  if (form && submitBtn && addOccupantBtn) {
    form.addEventListener('input', () => {
      submitBtn.disabled = !checkFormValidity(form);
    });

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
        document.getElementById('content').innerHTML = `
          <header>
              <h1>Higgins Woodland Retreat - Rental Application</h1>
          </header>
          <p style="text-align: center;">Thank you for your application. We will be in touch soon!</p>
        `;
      } catch (error) {
        console.error('Submission error:', error);
        alert("Error submitting application: " + error.message);
      }
    });

    addOccupantBtn.addEventListener('click', addOccupant);
  } else {
    console.error('Form, submit button, or add occupant button not found in DOM');
  }
}

if (document.getElementById('applicationsTable')) {
  signInAnonymously(auth).then(() => {
    const passcode = prompt('Enter admin passcode:');
    if (passcode === 'Porky9') {
      document.getElementById('adminContent').style.display = 'block';
      onSnapshot(collection(db, 'applications'), (snapshot) => {
        const tbody = document.querySelector('#applicationsTable tbody');
        if (tbody) {
          tbody.innerHTML = '';
          snapshot.forEach((doc) => {
            const data = doc.data();
            const occupants = data.occupants || [];
            const estTime = data.submitted ? new Date(data.submitted).toLocaleString('en-US', { timeZone: 'America/New_York' }) : 'N/A';
            const messagePreview = (data.personalMessage || '').substring(0, 60) + (data.personalMessage && data.personalMessage.length > 60 ? '...' : '');
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${data.fullName || 'N/A'}</td>
              <td>${occupants.length > 0 ? occupants[0].age || 'N/A' : 'N/A'}</td>
              <td>${occupants.length || 'N/A'}</td>
              <td>${data.income || 'N/A'}</td>
              <td>${data.jobTitle || 'N/A'}</td>
              <td>${data.employer || 'N/A'}</td>
              <td>${estTime}</td>
              <td>${messagePreview}</td>
              <td><button onclick="viewDetails('${doc.id}')">View</button></td>
            `;
            tbody.appendChild(row);
          });
        } else {
          console.error('Table body not found');
        }
      });
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    console.error('Admin authentication error:', error);
    alert('Authentication failed: ' + error.message);
  });
}

function viewDetails(id) {
  const docRef = doc(db, 'applications', id);
  getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      let content = '<h2>Application Details</h2>';
      content += `<p><strong>Full Name:</strong> ${data.fullName || 'N/A'}</p>`;
      content += `<p><strong>Date of Birth:</strong> ${data.dob || 'N/A'}</p>`;
      content += `<p><strong>Current Address:</strong> ${data.currentAddress || 'N/A'}</p>`;
      content += `<p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>`;
      content += `<p><strong>Email:</strong> ${data.email || 'N/A'}</p>`;
      content += '<h3>Employment</h3>';
      content += `<p><strong>Job Title:</strong> ${data.jobTitle || 'N/A'}</p>`;
      content += `<p><strong>Employer:</strong> ${data.employer || 'N/A'}</p>`;
      content += `<p><strong>Length of Employment (years):</strong> ${data.employmentLength || 'N/A'}</p>`;
      content += `<p><strong>Monthly Income:</strong> ${data.income || 'N/A'}</p>`;
      content += '<h3>Occupants</h3>';
      if (data.occupants && data.occupants.length > 0) {
        data.occupants.forEach((o, i) => {
          content += `<p><strong>Occupant ${i + 1} - Name:</strong> ${o.name || 'N/A'}, <strong>Relationship:</strong> ${o.relation || 'N/A'}, <strong>Age:</strong> ${o.age || 'N/A'}, <strong>Gender:</strong> ${o.gender || 'N/A'}</p>`;
        });
      } else {
        content += '<p>No occupants listed</p>';
      }
      content += '<h3>References</h3>';
      if (data.references && data.references.length > 0) {
        data.references.forEach((r, i) => {
          content += `<p><strong>Reference ${i + 1} - Name:</strong> ${r.name || 'N/A'}, <strong>Phone:</strong> ${r.phone || 'N/A'}, <strong>Relationship:</strong> ${r.relation || 'N/A'}</p>`;
        });
      } else {
        content += '<p>No references listed</p>';
      }
      content += '<h3>Personal Message</h3>';
      content += `<p>${data.personalMessage || 'N/A'}</p>`;
      content += '<h3>Comments/Questions</h3>';
      content += `<p>${data.comments || 'N/A'}</p>`;
      content += `<p><strong>Submitted:</strong> ${data.submitted ? new Date(data.submitted).toLocaleString('en-US', { timeZone: 'America/New_York' }) : 'N/A'}</p>`;

      const modal = document.getElementById('detailModal');
      const contentDiv = document.getElementById('detailContent');
      if (modal && contentDiv) {
        contentDiv.innerHTML = content;
        modal.style.display = 'block';
      } else {
        console.error('Detail modal or content div not found. Creating fallback...');
        const fallbackModal = document.createElement('div');
        fallbackModal.id = 'detailModal';
        fallbackModal.className = 'modal';
        fallbackModal.innerHTML = `<span class="close" onclick="closeDetailModal()">×</span><div id="detailContent"></div>`;
        document.body.appendChild(fallbackModal);
        document.getElementById('detailContent').innerHTML = content;
        fallbackModal.style.display = 'block';
      }
    } else {
      alert('Document not found');
    }
  }).catch((error) => {
    console.error('View details error:', error);
    alert('Error viewing details: ' + error.message);
  });
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function sortTable(n) {
  const table = document.getElementById('applicationsTable');
  if (table) {
    let switching = true;
    let dir = localStorage.getItem(`sortDir_${n}`) === 'desc' ? 'desc' : 'asc';
    let switchcount = 0;
    const th = document.getElementById(`sort${['Name', 'Age', 'Total', 'Income', 'Job', 'Company', 'Time', 'Message'][n]}`);
    // Clear previous sort indicators
    document.querySelectorAll('th').forEach(t => {
      t.classList.remove('sorted-asc', 'sorted-desc');
    });
    if (th) {
      th.classList.add(`sorted-${dir}`);
    } else {
      console.warn('Sort header not found for column:', n);
    }

    while (switching) {
      switching = false;
      const rows = table.rows;
      for (let i = 1; i < (rows.length - 1); i++) {
        let shouldSwitch = false;
        const x = rows[i].getElementsByTagName('TD')[n];
        const y = rows[i + 1].getElementsByTagName('TD')[n];
        if (dir === 'asc') {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir === 'desc') {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
      } else {
        if (switchcount === 0) {
          dir = dir === 'asc' ? 'desc' : 'asc';
          localStorage.setItem(`sortDir_${n}`, dir);
          switching = true;
        }
      }
    }
  } else {
    console.error('Table not found for sorting');
  }
}
