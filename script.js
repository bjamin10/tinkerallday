let classCount = 0;

function addClass() {
  classCount++;
  const div = document.createElement("div");
  const classId = "class-" + classCount;

  div.className = "class-container";
  div.id = classId;
    div.innerHTML = `
  <div class="class-row">
    <input type="text" class="class-name" placeholder="Class 1" value="Class ${classCount}" style="width: 120px; margin-right: 10px;">
    
    <div class="custom-dropdown grade-dropdown" tabindex="0" data-type="grade">
      <div class="selected">Grade</div>
      <div class="dropdown-options" style="display:none;">
        <div data-value="4.0">A</div>
        <div data-value="3.7">A-</div>
        <div data-value="3.3">B+</div>
        <div data-value="3.0">B</div>
        <div data-value="2.7">B-</div>
        <div data-value="2.3">C+</div>
        <div data-value="2.0">C</div>
        <div data-value="1.7">C-</div>
        <div data-value="1.3">D+</div>
        <div data-value="1.0">D</div>
        <div data-value="0">F</div>
      </div>
    </div>
    <div class="custom-dropdown class-dropdown" tabindex="0" data-type="weight">
      <div class="selected">Class Type</div>
      <div class="dropdown-options" style="display:none;">
        <div data-value="0">Regular</div>
        <div data-value="0.5">Honors</div>
        <div data-value="1">AP</div>
      </div>
    </div>

    <button class="class-remove-btn" onclick="removeClassRow('${classId}')">✕</button>
  </div>
`;

  document.getElementById("classes").appendChild(div);
  updateGPA();
}

function removeClassRow(classId) {
  document.getElementById(classId).remove();
  updateGPA();
}

function updateGPA() {
  let grades = document.querySelectorAll(".grade");
  let weights = document.querySelectorAll(".weight");

  if (grades.length === 0) {
    document.getElementById("gpaResult").innerText = "";
    return;
  }

  for (let i = 0; i < grades.length; i++) {
    if (grades[i].value === "" || weights[i].value === "") {
      document.getElementById("gpaResult").innerText = "";
      return;
    }
  }

  let total = 0;

  for (let i = 0; i < grades.length; i++) {
    let grade = parseFloat(grades[i].value);
    let weight = parseFloat(weights[i].value);

    total += grade + weight;
  }

  let gpa = total / grades.length;

  document.getElementById("gpaResult").innerText = "GPA: " + gpa.toFixed(2);
}

let categories = {};

function addCategory() {
  let categoryName = document.getElementById("categoryInput").value.trim();
  let categoryWeight = parseFloat(document.getElementById("categoryWeightInput").value);

  if (!categoryName || isNaN(categoryWeight) || categoryWeight < 0 || categoryWeight > 100) {
    alert("Please enter a valid category name and weight (0-100)");
    return;
  }

  if (categories[categoryName]) {
    alert("Category already exists");
    return;
  }

  categories[categoryName] = { weight: categoryWeight, assignments: [] };

  document.getElementById("categoryInput").value = "";
  document.getElementById("categoryWeightInput").value = "";

  renderSimulator();
}

function addAssignment(categoryName) {
  categories[categoryName].assignments.push({ points: 0, pointsPossible: 0 });
  renderSimulator();
}

function updateAssignment(categoryName, index, field, value) {
  categories[categoryName].assignments[index][field] = parseFloat(value) || 0;
  calculateSimulatedGrade();
}

function removeCategory(categoryName) {
  delete categories[categoryName];
  renderSimulator();
}

function removeAssignment(categoryName, index) {
  categories[categoryName].assignments.splice(index, 1);
  renderSimulator();
}

function renderSimulator() {
  let html = `
    <div style="margin-bottom: 20px;">
      <h3>Add Assignment Category</h3>
      <input type="text" id="categoryInput" placeholder="Category Name (e.g., Homework, Tests)">
      <input type="number" id="categoryWeightInput" placeholder="Weight (%)" min="0" max="100">
      <button onclick="addCategory()">Add Category</button>
    </div>
  `;

  for (let categoryName in categories) {
    let category = categories[categoryName];
    html += `
      <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4>${categoryName} (${category.weight}% weight)</h4>
          <button onclick="removeCategory('${categoryName}')" style="background-color: #c94c4c;">Delete</button>
        </div>
        
        <div id="assignments-${categoryName}">
    `;

    category.assignments.forEach((assignment, index) => {
      html += `
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
          <input type="number" value="${assignment.points}" 
            onchange="updateAssignment('${categoryName}', ${index}, 'points', this.value)"
            placeholder="Points" style="width: 80px;">
          <span>/</span>
          <input type="number" value="${assignment.pointsPossible}" 
            onchange="updateAssignment('${categoryName}', ${index}, 'pointsPossible', this.value)"
            placeholder="Points Possible" style="width: 120px;">
          <button onclick="removeAssignment('${categoryName}', ${index})" style="background-color: #e88888; padding: 8px 12px;">Remove</button>
        </div>
      `;
    });

    html += `
        </div>
        <button onclick="addAssignment('${categoryName}')" style="margin-top: 10px; background-color: #8aaa4f;">Add Assignment</button>
      </div>
    `;
  }

  html += `<h3 id="simResult" style="margin-top: 20px;"></h3>`;

  document.getElementById("simulatorContainer").innerHTML = html;
  calculateSimulatedGrade();
}

function calculateSimulatedGrade() {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (let categoryName in categories) {
    let category = categories[categoryName];
    let totalPoints = 0;
    let totalPossible = 0;

    category.assignments.forEach(assignment => {
      totalPoints += assignment.points;
      totalPossible += assignment.pointsPossible;
    });

    if (totalPossible > 0) {
      let categoryPercentage = (totalPoints / totalPossible) * 100;
      totalWeightedScore += categoryPercentage * (category.weight / 100);
      totalWeight += category.weight;
    }
  }

  if (totalWeight > 0) {
    let finalGrade = totalWeightedScore;
    document.getElementById("simResult").innerText = `Overall Grade: ${finalGrade.toFixed(1)}%`;
  } else {
    document.getElementById("simResult").innerText = `Overall Grade: --`;
  }
}

window.addEventListener("DOMContentLoaded", function() {
  classCount = 0;
  for (let i = 0; i < 7; i++) {
    addClass();
  }
});

// Custom dropdown handler
document.addEventListener('click', function(e) {
  // Close all dropdowns if clicking outside
  if (!e.target.closest('.custom-dropdown')) {
    document.querySelectorAll('.custom-dropdown .dropdown-options').forEach(opt => opt.style.display = 'none');
  }
});

document.addEventListener('focusin', function(e) {
  if (e.target.closest('.custom-dropdown')) {
    closeAllDropdowns(e.target.closest('.custom-dropdown'));
  }
});

function closeAllDropdowns(except) {
  document.querySelectorAll('.custom-dropdown').forEach(drop => {
    if (drop !== except) {
      drop.querySelector('.dropdown-options').style.display = 'none';
    }
  });
}

document.addEventListener('click', function(e) {
  // Show/hide dropdown
  const dropdown = e.target.closest('.custom-dropdown');
  if (dropdown && e.target.classList.contains('selected')) {
    const options = dropdown.querySelector('.dropdown-options');
    options.style.display = (options.style.display === 'none' ? 'block' : 'none');
  }
  // Handle selection
  if (dropdown && e.target.hasAttribute('data-value')) {
    let type = dropdown.dataset.type;
    let value = e.target.getAttribute('data-value');
    let text = e.target.textContent;
    dropdown.querySelector('.selected').textContent = text;
    dropdown.setAttribute('data-selected-value', value);
    dropdown.querySelector('.dropdown-options').style.display = 'none';
    updateGPA();
  }
});

// Modify updateGPA to work with custom dropdowns
function updateGPA() {
  let grades = document.querySelectorAll('.grade-dropdown');
  let weights = document.querySelectorAll('.class-dropdown');

  if (grades.length === 0) {
    document.getElementById("gpaResult").innerText = "";
    return;
  }

  for (let i = 0; i < grades.length; i++) {
    if (!grades[i].getAttribute("data-selected-value") || !weights[i].getAttribute("data-selected-value")) {
      document.getElementById("gpaResult").innerText = "";
      return;
    }
  }

  let total = 0;
  for (let i = 0; i < grades.length; i++) {
    let grade = parseFloat(grades[i].getAttribute("data-selected-value") || 0);
    let weight = parseFloat(weights[i].getAttribute("data-selected-value") || 0);

    total += grade + weight;
  }

  let gpa = total / grades.length;
  document.getElementById("gpaResult").innerText = "GPA: " + gpa.toFixed(2);
}