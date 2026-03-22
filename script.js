// GPA Calculator

const gradesScale = [
  {label:'A', value:4.0}, {label:'A-', value:3.7},
  {label:'B+', value:3.3}, {label:'B', value:3.0}, {label:'B-', value:2.7},
  {label:'C+', value:2.3}, {label:'C', value:2.0}, {label:'C-', value:1.7},
  {label:'D+', value:1.3}, {label:'D', value:1.0}, {label:'F', value:0}
];

const classTypes = [
  {label:'Class Type', value:''},
  {label:'Regular', value:0},
  {label:'Honors', value:0.5},
  {label:'AP', value:1}
];

// Start with 7 classes
for (let i = 0; i < 7; i++) addClass();

function addClass() {
  const div = document.createElement("div");
  div.className = "class-row";

  let gradeOptions = gradesScale.map(g=>`<option value="${g.value}">${g.label}</option>`).join('');
  gradeOptions = `<option value="" selected disabled>Grade</option>` + gradeOptions;

  let typeOptions = classTypes.map(t=>`<option value="${t.value}">${t.label}</option>`).join('');

  div.innerHTML = `
    <select class="grade" onchange="calculateGPA()">
      ${gradeOptions}
    </select>

    <select class="weight" onchange="calculateGPA()">
      ${typeOptions}
    </select>
  `;

  document.getElementById("classes").appendChild(div);
}

// Calculate GPA in real-time
function calculateGPA() {
  const grades = document.querySelectorAll(".grade");
  const weights = document.querySelectorAll(".weight");

  let total = 0;
  let count = 0;

  for (let i = 0; i < grades.length; i++) {
    const gradeVal = parseFloat(grades[i].value);
    const weightVal = parseFloat(weights[i].value);

    // Skip completely blank rows
    if (!grades[i].value && !weights[i].value) continue;

    // If one missing, stop calculation
    if (!grades[i].value || !weights[i].value) return;

    total += gradeVal + weightVal;
    count++;
  }

  if (count > 0) {
    document.getElementById("gpaResult").innerText = "GPA: " + (total / count).toFixed(2);
  }
}

const categoriesDiv = document.getElementById("categories");
let categories = [];

function addCategory() {
  const category = {
    name: `Category ${categories.length + 1}`,
    weight: 0,
    assignments: []
  };
  categories.push(category);
  renderCategories();
}

function renderCategories() {
  categoriesDiv.innerHTML = '';
  categories.forEach((cat, index) => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    catDiv.innerHTML = `
      <label>Category Name: <input type="text" value="${cat.name}" oninput="updateCategoryName(${index}, this.value)"></label>
      <label>Weight: <input type="number" value="${cat.weight}" oninput="updateCategoryWeight(${index}, this.value)" min="0" max="1" step="0.01"></label>
      <div class="assignments" id="assignments-${index}"></div>
      <button onclick="addAssignment(${index})">Add Assignment</button>
    `;
    categoriesDiv.appendChild(catDiv);
    renderAssignments(index);
  });
  calculateSimulatorGrade();
}

function addAssignment(catIndex) {
  categories[catIndex].assignments.push({points: 0, possible: 0});
  renderAssignments(catIndex);
}

function renderAssignments(catIndex) {
  const assignDiv = document.getElementById(`assignments-${catIndex}`);
  assignDiv.innerHTML = '';
  categories[catIndex].assignments.forEach((a, i) => {
    const row = document.createElement("div");
    row.className = "assignment-row";
    row.innerHTML = `
      <input type="number" placeholder="Points Earned" value="${a.points}" oninput="updateAssignment(${catIndex}, ${i}, 'points', this.value)">
      <input type="number" placeholder="Points Possible" value="${a.possible}" oninput="updateAssignment(${catIndex}, ${i}, 'possible', this.value)">
    `;
    assignDiv.appendChild(row);
  });
}

function updateCategoryName(catIndex, val) {
  categories[catIndex].name = val;
}

function updateCategoryWeight(catIndex, val) {
  categories[catIndex].weight = parseFloat(val) || 0;
  calculateSimulatorGrade();
}

function updateAssignment(catIndex, assignIndex, field, val) {
  categories[catIndex].assignments[assignIndex][field] = parseFloat(val) || 0;
  calculateSimulatorGrade();
}

function calculateSimulatorGrade() {
  let total = 0;
  let weightSum = 0;
  categories.forEach(cat => {
    let catScore = 0;
    let catTotal = 0;
    cat.assignments.forEach(a => { catScore += a.points; catTotal += a.possible; });
    if (catTotal > 0) {
      total += (catScore / catTotal) * cat.weight;
      weightSum += cat.weight;
    }
  });
  const finalGrade = weightSum ? (total / weightSum * 100).toFixed(2) : 0;
  document.getElementById("simResult").innerText = `Current Grade: ${finalGrade}%`;
}
