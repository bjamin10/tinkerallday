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

    <button class="class-remove-btn" onclick="removeClassRow('${classId}')">✕</button>
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

    <div style="margin-bottom: 25px;">
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
        <div style="display: flex; align-items: flex-end; gap: 15px; height: 200px; border-bottom: 2px solid #ccc; padding-bottom: 10px; overflow-x: auto;">
    `;

    // Draw bars for each category
    categoryData.forEach((cat, idx) => {
      const barHeight = (cat.weight / 100) * 150;
      html += `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
          <div style="background-color: ${cat.color}; width: 50px; height: ${barHeight}px; border-radius: 4px; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
          <span style="font-size: 12px; font-weight: 600; color: #3e2f1c; text-align: center; width: 60px;">${cat.name.substring(0, 10)}</span>
          <span style="font-size: 11px; color: #666; font-weight: 500;">${cat.weight.toFixed(1)}%</span>
        </div>
      `;
    });

    // Draw total weight bar
    const totalBarHeight = (totalWeight / 100) * 150;
    let totalColor = totalWeight === 100 ? '#6a994e' : '#d4a574';
    html += `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-left: 20px; padding-left: 20px; border-left: 2px solid #ddd;">
        <div style="background-color: ${totalColor}; width: 50px; height: ${totalBarHeight}px; border-radius: 4px; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <span style="font-size: 12px; font-weight: 600; color: #3e2f1c; text-align: center;">TOTAL</span>
        <span style="font-size: 11px; color: #666; font-weight: 500;">${totalWeight.toFixed(1)}%</span>
      </div>
    `;

    html += `
        </div>
      </div>
    `;
  }

  html += `
    <div style="margin-bottom: 25px; padding: 15px; background-color: #f9f7f2; border-radius: 8px; border-left: 4px solid #a3b18a;">
      <h4 style="margin-top: 0;">Category Progress</h4>
  `;

  let hasCats = Object.keys(categories).length > 0;
  if (hasCats) {
    for (let categoryName in categories) {
      let category = categories[categoryName];
      let totalPoints = 0;
      let totalPossible = 0;

      category.assignments.forEach(assignment => {
        totalPoints += assignment.points;
        totalPossible += assignment.pointsPossible;
      });

      let percentage = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;
      let barColor = percentage >= 90 ? '#6a994e' : percentage >= 80 ? '#a3b18a' : percentage >= 70 ? '#d4a574' : '#c94c4c';

      html += `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 500;">${categoryName}</span>
            <span style="font-weight: 600; color: ${barColor};">${percentage.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; height: 20px; background-color: #e8e4db; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background-color: ${barColor}; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;
    }
  } else {
    html += `<p style="color: #999; font-size: 14px;">Add a category to see progress bars</p>`;
  }

  html += `
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
            oninput="updateAssignment('${categoryName}', ${index}, 'points', this.value)"
            placeholder="Points" style="width: 80px;">
          <span>/</span>
          <input type="number" value="${assignment.pointsPossible}" 
            onchange="updateAssignment('${categoryName}', ${index}, 'pointsPossible', this.value)"
            oninput="updateAssignment('${categoryName}', ${index}, 'pointsPossible', this.value)"
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