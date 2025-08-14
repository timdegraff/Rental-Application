// Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyBDNZBX_O-IJnwne7JXI_pZOKZBoO-B_BM",
  authDomain: "rental-application-3d10f.firebaseapp.com",
  projectId: "rental-application-3d10f",
  storageBucket: "rental-application-3d10f.firebasestorage.app",
  messagingSenderId: "433190078343",
  appId: "1:433190078343:web:d608f2b931ea70d0dd3522",
  measurementId: "G-2R36VNZ4ZT"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const images = [
  'images/photo1.jpg', 'images/photo2.jpg', 'images/photo3.jpg', 'images/photo4.jpg',
  // Add other 14 if using Git LFS or Firebase URLs later
];

let occupantCount = 1;
function addOccupant() {
  if (occupantCount >= 6) return;
  occupantCount++;
  const div = document.createElement('div');
  div.className = 'occupant';
  div.innerHTML = `
    <label>Name: <input type="text" name="occupantName[]" required></label>
    <label>Age: <input type="number" name="occupantAge[]" required></label>
    <label>Gender: <select name="occupantGender[]" required><option value="Male">Male</option><option value="Female">Female</option></select></label>
    <label>Relationship: <input type="text" name="occupantRelation[]" required></label>
    <label>Occupation (if adult): <input type="text" name="occupantOccupation[]"></label>
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
  firebase.auth().signInAnonymously().then(() => {
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
    const occupations = formData.getAll('occupantOccupation[]');
    for (let i = 0; i < names.length; i++) {
      data.occupants.push({ name: names[i], age: ages[i], gender: genders[i], relation: relations[i], occupation: occupations[i] });
    }
    data.references = [];
    const refNames = formData.getAll('refName[]');
    const refPhones = formData.getAll('refPhone[]');
    const refRelations = formData.getAll('refRelation[]');
    for (let i = 0; i < refNames.length; i++) {
      data.references.push({ name: refNames[i], phone: refPhones[i], relation: refRelations[i] });
    }
    data.submitted = firebase.firestore.Timestamp.now();

    let idUrl = '';
    const file = formData.get('idUpload');
    if (file && file.size <= 5000000 && file.size <= 20000000) {
      const ref = storage.ref().child(`ids/${Date.now()}_${file.name}`);
      await ref.put(file);
      idUrl = await ref.getDownloadURL();
    }
    data.idUrl = idUrl;

    await db.collection('applications').add(data);
    alert('Application submitted!');
    e.target.reset();
  });
}

if (document.getElementById('applicationsTable')) {
  firebase.auth().signInAnonymously().then(() => {
    const passcode = prompt('Enter admin passcode:');
    if (passcode === 'Porky9') {
      document.getElementById('adminContent').style.display = 'block';
      db.collection('applications').onSnapshot(snapshot => {
        const tbody = document.querySelector('#applicationsTable tbody');
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
          const data = doc.data();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${data.fullName}</td>
            <td>${data.income}</td>
            <td>${data.submitted.toDate().toLocaleString()}</td>
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
  db.collection('applications').doc(id).get().then(doc => {
    if (doc.exists) {
      alert(JSON.stringify(doc.data(), null, 2));
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
