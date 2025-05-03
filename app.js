// Initialize student array from localStorage or empty array
let students = JSON.parse(localStorage.getItem('students')) || [];
let editIndex = null;
let currentAction = null;
let actionIndex = null;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentTable = document.getElementById('studentTable').querySelector('tbody');
const submitBtn = document.querySelector('.submit-btn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const countElement = document.getElementById('count');
const modal = document.getElementById('confirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const confirmBtn = document.getElementById('confirmBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const toast = document.getElementById('toast');

// Form inputs with error messages
const inputs = {
    name: document.getElementById('studentName'),
    id: document.getElementById('studentId'),
    email: document.getElementById('email'),
    contact: document.getElementById('contactNo')
};

const errorMessages = {
    name: document.getElementById('nameError'),
    id: document.getElementById('idError'),
    email: document.getElementById('emailError'),
    contact: document.getElementById('contactError')
};

// Initial display
displayStudents();
updateCount();

// Event Listeners
studentForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', filterStudents);
confirmBtn.addEventListener('click', confirmAction);
cancelModalBtn.addEventListener('click', closeModal);

// Form Submission
function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const student = {
        name: inputs.name.value.trim(),
        id: inputs.id.value.trim(),
        email: inputs.email.value.trim(),
        contact: inputs.contact.value.trim()
    };

    if (editIndex !== null) {
        // Update existing student
        students[editIndex] = student;
        showToast('Student updated successfully!');
    } else {
        // Add new student
        // Check if student ID already exists
        if (students.some(s => s.id === student.id)) {
            errorMessages.id.textContent = 'Student ID already exists';
            inputs.id.focus();
            return;
        }
        students.push(student);
        showToast('Student added successfully!');
    }

    saveToLocalStorage();
    displayStudents();
    resetForm();
}

// Display Students in Table
function displayStudents(filteredStudents = null) {
    studentTable.innerHTML = '';
    const studentsToDisplay = filteredStudents || students;

    if (studentsToDisplay.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="empty-message">No students found</td>`;
        studentTable.appendChild(row);
        updateCount(0);
        return;
    }

    studentsToDisplay.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.email}</td>
            <td>${student.contact}</td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" data-index="${index}">
                    <span class="material-symbols-outlined">edit</span> Edit
                </button>
                <button class="action-btn delete-btn" data-index="${index}">
                    <span class="material-symbols-outlined">delete</span> Delete
                </button>
            </td>
        `;
        studentTable.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editStudent);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', showDeleteConfirmation);
    });

    updateCount(studentsToDisplay.length);
}

// Edit Student
function editStudent(e) {
    const index = e.target.closest('button').dataset.index;
    const student = students[index];

    inputs.name.value = student.name;
    inputs.id.value = student.id;
    inputs.email.value = student.email;
    inputs.contact.value = student.contact;

    editIndex = index;
    submitBtn.textContent = 'Update Student';
    cancelBtn.style.display = 'block';
    inputs.name.focus();
}

// Show Delete Confirmation
function showDeleteConfirmation(e) {
    const index = e.target.closest('button').dataset.index;
    const student = students[index];

    currentAction = 'delete';
    actionIndex = index;

    modalTitle.textContent = 'Confirm Deletion';
    modalMessage.textContent = `Are you sure you want to delete ${student.name} (ID: ${student.id})?`;
    modal.style.display = 'flex';
}

// Confirm Action (Delete)
function confirmAction() {
    if (currentAction === 'delete' && actionIndex !== null) {
        students.splice(actionIndex, 1);
        saveToLocalStorage();
        displayStudents();

        if (editIndex === actionIndex) {
            resetForm();
        }

        showToast('Student deleted successfully!');
    }

    closeModal();
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
    currentAction = null;
    actionIndex = null;
}

// Filter Students
function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
        displayStudents();
        return;
    }

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.id.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.contact.toLowerCase().includes(searchTerm)
    );

    displayStudents(filtered);
}

// Form Validation
function validateForm() {
    let isValid = true;

    // Clear all error messages
    Object.values(errorMessages).forEach(el => el.textContent = '');

    // Name validation (letters and spaces only)
    if (!/^[a-zA-Z\s]{2,}$/.test(inputs.name.value.trim())) {
        errorMessages.name.textContent = 'Please enter a valid name (minimum 2 letters)';
        inputs.name.focus();
        isValid = false;
    }

    // ID validation (numbers only)
    if (!/^\d{4,}$/.test(inputs.id.value.trim())) {
        errorMessages.id.textContent = 'Student ID must contain at least 4 numbers';
        inputs.id.focus();
        isValid = false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email.value.trim())) {
        errorMessages.email.textContent = 'Please enter a valid email address';
        inputs.email.focus();
        isValid = false;
    }

    // Contact validation (numbers only, 10 digits)
    if (!/^\d{10}$/.test(inputs.contact.value.trim())) {
        errorMessages.contact.textContent = 'Phone number must be 10 digits';
        inputs.contact.focus();
        isValid = false;
    }

    return isValid;
}

// LocalStorage Operations
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Reset Form
function resetForm() {
    studentForm.reset();
    editIndex = null;
    submitBtn.textContent = 'Add Student';
    cancelBtn.style.display = 'none';
    // Clear all error messages
    Object.values(errorMessages).forEach(el => el.textContent = '');
}

// Update Records Count
function updateCount(count = null) {
    countElement.textContent = count !== null ? count : students.length;
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show';

    // Set background color based on type
    if (type === 'success') {
        toast.style.backgroundColor = 'var(--success)';
    } else if (type === 'error') {
        toast.style.backgroundColor = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.backgroundColor = 'var(--warning)';
    }

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}