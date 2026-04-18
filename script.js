let classCount = 0;

// localStorage helpers
function saveGPAData() {
  const gpaData = [];
  document.querySelectorAll('.class-container').forEach(container => {
    const name = container.querySelector('.class-name').value;
    const grade = container.querySelector('.grade-dropdown').getAttribute('data-selected-value') || '';
    const weight = container.querySelector('.class-dropdown').getAttribute('data-selected-value') || '';
    gpaData.push({ name, grade, weight });
  });
  localStorage.setItem('gpaData', JSON.stringify(gpaData));
}

function loadGPAData() {
  const saved = localStorage.getItem('gpaData');
  return saved ? JSON.parse(saved) : null;
}

function saveSimulatorData() {
  localStorage.setItem('simulatorData', JSON.stringify(categories));
}

function loadSimulatorData() {
  const saved = localStorage.getItem('simulatorData');
  return saved ? JSON.parse(saved) : {};
}

function addClass() {
  classCount++;
  const div = document.createElement("div");
  const classId = "class-" + classCount;

  div.className = "class-container";
  div.id = classId;
    div.innerHTML = `
  <div class="class-row">
    <input type="text" class="class-name" placeholder="Class 1" value="Class ${classCount}" style="width: 120px; margin-right: 10px;" onchange="saveGPAData()" oninput="updateGPA()">
    
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

    <button class="class-remove-btn danger-btn" onclick="removeClassRow('${classId}')">✕</button>
  </div>
`;

  document.getElementById("classes").appendChild(div);
  updateGPA();
}

function removeClassRow(classId) {
  document.getElementById(classId).remove();
  saveGPAData();
  updateGPA();
}

function resetGPACalculator() {
  localStorage.removeItem('gpaData');
  document.getElementById('classes').innerHTML = '';
  classCount = 0;
  for (let i = 0; i < 7; i++) {
    addClass();
  }
  updateGPA();
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
  saveSimulatorData();
  document.getElementById("categoryInput").value = "";
  document.getElementById("categoryWeightInput").value = "";

  renderSimulator();
}

function addAssignment(categoryName) {
  categories[categoryName].assignments.push({ points: 0, pointsPossible: 0 });
  saveSimulatorData();
  renderSimulator();
}

function updateAssignment(categoryName, index, field, value) {
  categories[categoryName].assignments[index][field] = parseFloat(value) || 0;
  saveSimulatorData();
  calculateSimulatedGrade();
}

function removeCategory(categoryName) {
  delete categories[categoryName];
  saveSimulatorData();
  renderSimulator();
}

function removeAssignment(categoryName, index) {
  categories[categoryName].assignments.splice(index, 1);
  saveSimulatorData();
  renderSimulator();
}

function resetSimulator() {
  localStorage.removeItem('simulatorData');
  categories = {};
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

  // Generate category weighting chart
  let totalWeight = 0;
  const categoryData = [];
  const colors = ['#6a994e', '#8aaa4f', '#a3b18a', '#d4a574', '#c94c4c', '#9b7e6b'];
  
  for (let categoryName in categories) {
    totalWeight += categories[categoryName].weight;
    categoryData.push({
      name: categoryName,
      weight: categories[categoryName].weight,
      color: colors[Object.keys(categories).indexOf(categoryName) % colors.length]
    });
  }

  if (categoryData.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <h4 style="margin-top: 0;">Category Weighting</h4>
        <div class="weighting-chart">
    `;

    categoryData.forEach(cat => {
      const barHeight = (cat.weight / 100) * 130;
      html += `
        <div class="weight-bar">
          <div style="background-color: ${cat.color}; width: 40px; height: ${barHeight}px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
          <span>${cat.name}</span>
          <span>${cat.weight.toFixed(1)}%</span>
        </div>
      `;
    });

    const totalBarHeight = Math.min((totalWeight / 100) * 130, 130);
    let totalColor = totalWeight === 100 ? '#6a994e' : '#d4a574';
    html += `
      <div class="weight-bar" style="margin-left: 20px; padding-left: 20px; border-left: 2px solid #ddd;">
        <div style="background-color: ${totalColor}; width: 40px; height: ${totalBarHeight}px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <span style="font-weight: 600;">TOTAL</span>
        <span>${totalWeight.toFixed(1)}%</span>
      </div>
    `;

    html += `
        </div>
      </div>
    `;
  }

  if (categoryData.length === 0) {
    html += `<p style="color: #999; font-size: 14px; margin-bottom: 20px;">Start by adding one or more categories to see how they're weighted.</p>`;
  }

  for (let categoryName in categories) {
    let category = categories[categoryName];
    html += `
      <div class="category-card">
        <div class="category-card-header">
          <h4>${categoryName} (${category.weight}% weight)</h4>
          <button class="danger-btn small-btn" onclick="removeCategory('${categoryName}')">Remove</button>
        </div>
    `;

    category.assignments.forEach((assignment, index) => {
      html += `
        <div class="assignment-row">
          <div>
            <label>Earned</label>
            <input type="number" value="${assignment.points}" oninput="updateAssignment('${categoryName}', ${index}, 'points', this.value)" placeholder="Earned" />
          </div>
          <div>
            <label>Possible</label>
            <input type="number" value="${assignment.pointsPossible}" oninput="updateAssignment('${categoryName}', ${index}, 'pointsPossible', this.value)" placeholder="Possible" />
          </div>
          <button class="danger-btn small-btn" onclick="removeAssignment('${categoryName}', ${index})">Remove</button>
        </div>
      `;
    });

    html += `
        <button onclick="addAssignment('${categoryName}')">Add Assignment</button>
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
  // Load GPA data
  classCount = 0;
  const gpaData = loadGPAData();
  
  if (gpaData && gpaData.length > 0) {
    gpaData.forEach(classData => {
      addClass();
      const lastContainer = document.querySelector('.class-container:last-child');
      lastContainer.querySelector('.class-name').value = classData.name;
      
      if (classData.grade) {
        const gradeDropdown = lastContainer.querySelector('.grade-dropdown');
        gradeDropdown.setAttribute('data-selected-value', classData.grade);
        gradeDropdown.querySelector('.selected').textContent = getGradeLabel(classData.grade);
      }
      
      if (classData.weight) {
        const weightDropdown = lastContainer.querySelector('.class-dropdown');
        weightDropdown.setAttribute('data-selected-value', classData.weight);
        weightDropdown.querySelector('.selected').textContent = getWeightLabel(classData.weight);
      }
    });
  } else {
    for (let i = 0; i < 7; i++) {
      addClass();
    }
  }
  
  updateGPA();
  
  // Load simulator data
  const simData = loadSimulatorData();
  if (Object.keys(simData).length > 0) {
    categories = simData;
    renderSimulator();
  } else {
    renderSimulator();
  }
});

function getGradeLabel(value) {
  const grades = {
    '4.0': 'A', '3.7': 'A-', '3.3': 'B+', '3.0': 'B', '2.7': 'B-',
    '2.3': 'C+', '2.0': 'C', '1.7': 'C-', '1.3': 'D+', '1.0': 'D', '0': 'F'
  };
  return grades[value] || 'Grade';
}

function getWeightLabel(value) {
  const weights = { '0': 'Regular', '0.5': 'Honors', '1': 'AP' };
  return weights[value] || 'Class Type';
}

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
  const dropdown = e.target.closest('.custom-dropdown');

  // CLICK ON DROPDOWN BUTTON
  if (dropdown && e.target.classList.contains('selected')) {
    const options = dropdown.querySelector('.dropdown-options');
    const row = dropdown.closest('.class-row');

    // Close everything first
    document.querySelectorAll('.class-row').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.custom-dropdown .dropdown-options').forEach(opt => opt.style.display = 'none');

    const isOpen = options.style.display === 'block';

    if (!isOpen) {
      row.classList.add('active');
      options.style.display = 'block';
    } else {
      options.style.display = 'none';
    }
    return;
  }

  // CLICK OPTION
  if (dropdown && e.target.hasAttribute('data-value')) {
    let value = e.target.getAttribute('data-value');
    let text = e.target.textContent;

    dropdown.querySelector('.selected').textContent = text;
    dropdown.setAttribute('data-selected-value', value);
    dropdown.querySelector('.dropdown-options').style.display = 'none';

    // remove active state after selection
    const row = dropdown.closest('.class-row');
    if (row) row.classList.remove('active');

    updateGPA();
    return;
  }

  // CLICK OUTSIDE → CLOSE EVERYTHING
  if (!e.target.closest('.custom-dropdown')) {
    document.querySelectorAll('.dropdown-options').forEach(opt => opt.style.display = 'none');
    document.querySelectorAll('.class-row').forEach(r => r.classList.remove('active'));
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

  let filledCount = 0;
  let total = 0;

  // Only count classes that have both grade and weight selected
  for (let i = 0; i < grades.length; i++) {
    let gradeValue = grades[i].getAttribute("data-selected-value");
    let weightValue = weights[i].getAttribute("data-selected-value");

    if (gradeValue && weightValue) {
      let grade = parseFloat(gradeValue);
      let weight = parseFloat(weightValue);
      total += grade + weight;
      filledCount++;
    }
  }

  if (filledCount === 0) {
    document.getElementById("gpaResult").innerText = "";
  } else {
    let gpa = total / filledCount;
    document.getElementById("gpaResult").innerText = "GPA: " + gpa.toFixed(2);
  }

  saveGPAData();
}