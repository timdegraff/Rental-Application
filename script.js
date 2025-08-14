// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, getDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

function exportToExcel() {
  const table = document.getElementById('applicationsTable');
  if (!table) {
    console.error('Table not found for export');
    alert('Unable to export: Table not found.');
    return;
  }
  let csv = [];
  const headers = Array.from(table.querySelectorAll('th')).map(th => `"${th.textContent.replace(/"/g, '""')}"`);
  csv.push(headers.join(','));
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('td')).map(td => `"${td.textContent.replace(/"/g, '""')}"`);
    csv.push(cols.join(','));
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'rental_applications.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
        // Capture submission time on button click
        data.submitted = new Date().toISOString();

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
      const table = document.getElementById('applicationsTable');
      const tbody = table ? table.querySelector('tbody') : null;
      if (tbody) {
        onSnapshot(collection(db, 'applications'), (snapshot) => {
          tbody.innerHTML = '';
          snapshot.forEach((doc) => {
            const data = doc.data();
            const occupants = data.occupants || [];
            const estTime = data.submitted ? new Date(data.submitted).toLocaleString('en-US', { timeZone: 'America/New_York', hour12: true }) : 'N/A';
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${data.fullName || 'N/A'}</td>
              <td>${occupants.length > 0 ? occupants[0].age || 'N/A' : 'N/A'}</td>
              <td>${occupants.length || 'N/A'}</td>
              <td>${data.income || 'N/A'}</td>
              <td>${data.jobTitle || 'N/A'}</td>
              <td>${data.employer || 'N/A'}</td>
              <td>${estTime}</td>
              <td>${data.personalMessage || 'N/A'}</td>
              <td>${data.dob || 'N/A'}</td>
              <td>${data.currentAddress || 'N/A'}</td>
              <td>${data.phone || 'N/A'}</td>
              <td>${data.email || 'N/A'}</td>
              <td>${data.employmentLength || 'N/A'}</td>
              <td>${data.petType || 'N/A'}</td>
              <td>${data.petAge || 'N/A'}</td>
              <td>${data.petWeight || 'N/A'}</td>
              <td>${data.petBehavior || 'N/A'}</td>
              <td>${data.comments || 'N/A'}</td>
              <td>${occupants[0] ? occupants[0].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[0] ? occupants[0].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[0] ? occupants[0].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[0] ? occupants[0].gender || 'N/A' : 'N/A'}</td>
              <td>${occupants[1] ? occupants[1].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[1] ? occupants[1].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[1] ? occupants[1].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[1] ? occupants[1].gender || 'N/A' : 'N/A'}</td>
              <td>${occupants[2] ? occupants[2].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[2] ? occupants[2].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[2] ? occupants[2].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[2] ? occupants[2].gender || 'N/A' : 'N/A'}</td>
              <td>${occupants[3] ? occupants[3].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[3] ? occupants[3].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[3] ? occupants[3].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[3] ? occupants[3].gender || 'N/A' : 'N/A'}</td>
              <td>${occupants[4] ? occupants[4].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[4] ? occupants[4].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[4] ? occupants[4].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[4] ? occupants[4].gender || 'N/A' : 'N/A'}</td>
              <td>${occupants[5] ? occupants[5].name || 'N/A' : 'N/A'}</td>
              <td>${occupants[5] ? occupants[5].relation || 'N/A' : 'N/A'}</td>
              <td>${occupants[5] ? occupants[5].age || 'N/A' : 'N/A'}</td>
              <td>${occupants[5] ? occupants[5].gender || 'N/A' : 'N/A'}</td>
              <td>${data.references[0] ? data.references[0].name || 'N/A' : 'N/A'}</td>
              <td>${data.references[0] ? data.references[0].phone || 'N/A' : 'N/A'}</td>
              <td>${data.references[0] ? data.references[0].relation || 'N/A' : 'N/A'}</td>
              <td>${data.references[1] ? data.references[1].name || 'N/A' : 'N/A'}</td>
              <td>${data.references[1] ? data.references[1].phone || 'N/A' : 'N/A'}</td>
              <td>${data.references[1] ? data.references[1].relation || 'N/A' : 'N/A'}</td>
            `;
            tbody.appendChild(row);
          });
        }, (error) => {
          console.error('Snapshot error:', error);
        });
      } else {
        console.error('Table body not found');
      }
    } else {
      alert('Invalid passcode');
    }
  }).catch((error) => {
    console.error('Admin authentication error:', error);
    alert('Authentication failed: ' + error.message);
  });
}

function sortTable(n) {
  const table = document.getElementById('applicationsTable');
  if (table) {
    let switching = true;
    let dir = localStorage.getItem(`sortDir_${n}`) === 'desc' ? 'desc' : 'asc';
    let switchcount = 0;
    const th = document.getElementById(`sort${['Name', 'Age', 'Total', 'Income', 'Job', 'Company', 'Date', 'Message', 'DOB', 'Address', 'Phone', 'Email', 'EmpLength', 'PetType', 'PetAge', 'PetWeight', 'PetBehavior', 'Comments', 'Occ1Name', 'Occ1Rel', 'Occ1Age', 'Occ1Gen', 'Occ2Name', 'Occ2Rel', 'Occ2Age', 'Occ2Gen', 'Occ3Name', 'Occ3Rel', 'Occ3Age', 'Occ3Gen', 'Occ4Name', 'Occ4Rel', 'Occ4Age', 'Occ4Gen', 'Occ5Name', 'Occ5Rel', 'Occ5Age', 'Occ5Gen', 'Occ6Name', 'Occ6Rel', 'Occ6Age', 'Occ6Gen', 'Ref1Name', 'Ref1Phone', 'Ref1Rel', 'Ref2Name', 'Ref2Phone', 'Ref2Rel'][n]}`);
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
        if (x && y && x.innerHTML && y.innerHTML) {
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
