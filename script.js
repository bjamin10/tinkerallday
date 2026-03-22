function addClass() {
  const div = document.createElement("div");

  div.innerHTML = `
    <select class="grade">
      <option value="4">A</option>
      <option value="3">B</option>
      <option value="2">C</option>
      <option value="1">D</option>
      <option value="0">F</option>
    </select>

    <select class="weight">
      <option value="0">Regular</option>
      <option value="0.5">Honors</option>
      <option value="1">AP</option>
    </select>
  `;

  document.getElementById("classes").appendChild(div);
}

function calculateGPA() {
  let grades = document.querySelectorAll(".grade");
  let weights = document.querySelectorAll(".weight");

  let total = 0;

  for (let i = 0; i < grades.length; i++) {
    let grade = parseFloat(grades[i].value);
    let weight = parseFloat(weights[i].value);

    total += grade + weight;
  }

  let gpa = total / grades.length;

  document.getElementById("gpaResult").innerText = "GPA: " + gpa.toFixed(2);
}

function simulate() {
  let current = parseFloat(document.getElementById("current").value);
  let score = parseFloat(document.getElementById("score").value);
  let weight = parseFloat(document.getElementById("weight").value);

  let result = current * (1 - weight) + score * weight;

  document.getElementById("simResult").innerText =
    "New Grade: " + result.toFixed(2) + "%";
}
