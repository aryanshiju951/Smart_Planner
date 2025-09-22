
//All data is saved in browser localStorage
const STORAGE_KEY="study_planner_v1";

//Save state to localStorage
function saveState(state) {
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}

//Load state from localStorage
function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"subjects":[],"plan":[]}');
}

//Global state
let state=loadState();

//Rendering Functions

//Render subjects
function renderSubjects() {
  const list=document.getElementById("subjectsList");
  list.innerHTML="";

  if (state.subjects.length===0) {
    list.innerHTML="<div class='muted'>No subjects yet.</div>";
    return;
  }

  state.subjects.forEach(subject=>{
    const li=document.createElement("li");
    li.className="subject";
    li.innerHTML=`<span>${subject.name} (${subject.goal}m)</span>`;

    const deleteBtn=document.createElement("button");
    deleteBtn.textContent="Delete";
    deleteBtn.className="secondary";
    deleteBtn.onclick=()=>{
      state.subjects=state.subjects.filter(s=>s.id!==subject.id);
      saveState(state);
      renderSubjects();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

//Render plan
function renderPlan() {
  const list=document.getElementById("planList");
  const planArea=document.getElementById("planArea");
  const todaySummary=document.getElementById("todaySummary");

  list.innerHTML="";

  if (state.plan.length===0) {
    planArea.textContent="No plan yet.";
    todaySummary.textContent="No items";
    updateProgress();
    return;
  }

  planArea.textContent=`Total: ${state.plan.reduce((a, b) => a + b.minutes, 0)} minutes`;

  state.plan.forEach((item)=>{
    const li=document.createElement("li");
    li.className="plan-item"+(item.done?" done":"");
    li.innerHTML=`<span>${item.subject} (${item.minutes}m)</span>`;

    const checkbox=document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked=item.done;
    checkbox.onchange=()=>{
      item.done=checkbox.checked;
      saveState(state);
      renderPlan();
    };

    li.appendChild(checkbox);
    list.appendChild(li);
  });

  todaySummary.textContent=`${state.plan.length} items, ${state.plan.filter(p=>p.done).length} done`;
  updateProgress();
}

//Update progress bar
function updateProgress() {
  const fill=document.getElementById("progressFill");
  const progressText=document.getElementById("progressText");

  if (state.plan.length===0) {
    fill.style.width="0%";
    progressText.textContent="0%";
    return;
  }

  const done=state.plan.filter(p=>p.done).length;
  const percent= Math.round((done/state.plan.length)*100);

  fill.style.width=percent+"%";
  progressText.textContent=percent+"%";
}

//Generate a new plan
function generatePlan(available,strategy) {
  if (state.subjects.length===0) {
    alert("Add subjects first!");
    return;
  }

  const plan=[];

  if (strategy==="equal") {
    const share=Math.floor(available/state.subjects.length);
    state.subjects.forEach(s=>{
      plan.push({subject:s.name,minutes:Math.min(share,s.goal),done:false});
    });
  } else{
    const totalGoal=state.subjects.reduce((a,b)=>a+b.goal,0);
    state.subjects.forEach(s=>{
      const minutes=Math.floor((s.goal/totalGoal)*available);
      plan.push({subject:s.name,minutes:minutes,done:false});
    });
  }

  state.plan=plan;
  saveState(state);
  renderPlan();
}


document.getElementById("addSubjectBtn").onclick=()=>{
  const name=document.getElementById("subjectName").value.trim();
  const goal=parseInt(document.getElementById("subjectMinutes").value);

  if (!name || !goal) {
    alert("Enter subject and goal");
    return;
  }

  state.subjects.push({id:Date.now(),name:name,goal:goal});
  document.getElementById("subjectName").value="";
  document.getElementById("subjectMinutes").value="";

  saveState(state);
  renderSubjects();
};

document.getElementById("clearAllBtn").onclick=()=>{
  state={subjects:[],plan:[]};
  saveState(state);
  renderSubjects();
  renderPlan();
};

document.getElementById("generateBtn").onclick=()=>{
  const available=parseInt(document.getElementById("availableMinutes").value);
  if (!available) {
    alert("Enter available minutes");
    return;
  }
  const strategy=document.getElementById("strategy").value;
  generatePlan(available,strategy);
};

document.getElementById("saveBtn").onclick=()=>{
  saveState(state);
  alert("Saved!");
};

document.getElementById("markAllDone").onclick=()=>{
  state.plan.forEach(p=>p.done=true);
  saveState(state);
  renderPlan();
};

document.getElementById("resetDone").onclick=()=>{
  state.plan.forEach(p=>p.done=false);
  saveState(state);
  renderPlan();
};
//Initial Render
renderSubjects();
renderPlan();
