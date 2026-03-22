function addClass() {
  const div = document.createElement("div");

  div.innerHTML = `
  <div class="class-row">
  <select class="grade">
    <option value="" disabled selected>Grade</option>
    <option value="4.0">A</option>
    <option value="3.7">A-</option>
    <option value="3.3">B+</option>
    <option value="3.0">B</option>
    <option value="2.7">B-</option>
    <option value="2.3">C+</option>
    <option value="2.0">C</option>
    <option value="1.7">C-</option>
    <option value="1.3">D+</option>
    <option value="1.0">D</option>
    <option value="0">F</option>
  </select>

  <select class="weight">
    <option value="" disabled selected>Class Type</option>
    <option value="0">Regular</option>
    <option value="0.5">Honors</option>
    <option value="1">AP</option>
  </select>

  <select class="term">
    <option value="" disabled selected>Term</option>
    <option value="1">Semester</option>
    <option value="2">Full Year</option>
  </select>
</div>
`;

  document.getElementById("classes").appendChild(div);
}

function calculateGPA() {
  let grades = document.querySelectorAll(".grade");
  let weights = document.querySelectorAll(".weight");

  let total = 0;
  let count = 0;

  for (let i = 0; i < grades.length; i++) {
    let grade = parseFloat(grades[i].value);
    let weight = parseFloat(weights[i].value);

    // Only include if both grade and weight are selected
    if (!isNaN(grade) && !isNaN(weight)) {
      total += grade + weight;
      count++;
    }
  }

  let gpa = count > 0 ? total / count : 0;

  document.getElementById("gpaResult").innerText = "GPA: " + gpa.toFixed(2);
}

document.getElementById("classes").addEventListener("input", calculateGPA);


function simulate() {
  let current = parseFloat(document.getElementById("current").value);
  let score = parseFloat(document.getElementById("score").value);
  let weight = parseFloat(document.getElementById("weight").value);

  let result = current * (1 - weight) + score * weight;

  document.getElementById("simResult").innerText =
    "New Grade: " + result.toFixed(2) + "%";
}

let categories = [];

function addCategory() {
  let name = document.getElementById("newCategory").value;
  let weight = parseFloat(document.getElementById("newWeight").value);

  if(!name || isNaN(weight) || weight<=0) return alert("Enter valid category and weight.");

  categories.push({name, weight, assignments: []});

  let select = document.getElementById("assignmentCategory");
  let option = document.createElement("option");
  option.value = name;
  option.text = name;
  select.add(option);

  document.getElementById("newCategory").value = "";
  document.getElementById("newWeight").value = "";
  updateSimulator();
}

function addAssignment() {
  let catName = document.getElementById("assignmentCategory").value;
  let pointsPossible = parseFloat(document.getElementById("pointsPossible").value);
  let pointsReceived = parseFloat(document.getElementById("pointsReceived").value);

  if(!catName || isNaN(pointsPossible) || isNaN(pointsReceived)) return;

  let cat = categories.find(c => c.name === catName);
  cat.assignments.push({pointsReceived, pointsPossible});

  updateSimulator();
}

function updateSimulator() {
  let totalWeighted = 0;
  let totalWeight = 0;

  categories.forEach(cat => {
    let sumReceived = cat.assignments.reduce((a,b)=>a+b.pointsReceived,0);
    let sumPossible = cat.assignments.reduce((a,b)=>a+b.pointsPossible,0);
    if(sumPossible>0){
      let categoryPercent = sumReceived / sumPossible;
      totalWeighted += categoryPercent * cat.weight;
      totalWeight += cat.weight;
    }
  });

  let finalPercent = totalWeight>0 ? totalWeighted/totalWeight*100 : 0;
  document.getElementById("simResult").innerText = "Simulated Grade: " + finalPercent.toFixed(2) + "%";
}
