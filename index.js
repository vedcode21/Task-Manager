// Initial state
const state = {
  taskList: [],
};

// DOM elements
const taskModal = document.querySelector(".task__modal__body");
const taskContents = document.querySelector(".task__contents");
const notificationList = document.getElementById("notificationList");

// Template for task card
const htmlTaskContent = ({ id, title, description, type, url }) => `
  <div class="col-md-6 col-lg-4 mt-3" id=${id} key=${id}>
    <div class='card shadow-sm task__card'>
      <div class='card-header d-flex justify-content-end task__card__header'>
        <button type='button' class='btn btn-outline-primary me-2' name=${id} onclick="editTask.apply(this, arguments)">
          <i class='fas fa-pencil-alt name=${id}'></i>
        </button>
        <button type='button' class='btn btn-outline-danger' name=${id} onclick="deleteTask.apply(this, arguments)">
          <i class='fas fa-trash-alt name=${id}'></i>
        </button>
      </div>
      <div class='card-body'>
        ${
          url
            ? `<img width='100%' src=${url} alt='Card Image' class='card-img-top md-3 rounded-lg' />`
            : `<img width='100%' src="https://tse1.mm.bing.net/th?id=OIP.F00dCf4bXxX0J-qEEf4qIQHaD6&pid=Api&rs=1&c=1&qlt=95&w=223&h=117" alt='Card Image' class='card-img-top md-3 rounded-lg' />`
        }
        <h4 class='card-title task__card__title'>${title}</h4>
        <p class='description trim-3-lines text-muted'>${description}</p>
        <div class='tags text-white d-flex flex-wrap'>
          <span class='badge bg-primary m-1'>${type}</span>
        </div>
      </div>
      <div class='card-footer'>
        <button type='button' class='btn btn-outline-primary float-right' data-bs-toggle="modal" data-bs-target="#showTask" onclick='openTask.apply(this, arguments)' id=${id}>Open Task</button>
      </div>
    </div>
  </div>
`;

// Template for task modal
const htmlModalContent = ({ id, title, description, url }) => {
  const date = new Date(parseInt(id));
  return `
    <div id=${id}>
      ${
        url
          ? `<img width='100%' src=${url} alt='Card Image' class='card-img-top md-3 rounded-lg' />`
          : `<img width='100%' src="https://tse1.mm.bing.net/th?id=OIP.F00dCf4bXxX0J-qEEf4qIQHaD6&pid=Api&rs=1&c=1&qlt=95&w=223&h=117" alt='Card Image' class='card-img-top md-3 rounded-lg' />`
      }
      <strong class='text-muted text-sm'>Created on: ${date.toDateString()}</strong>
      <h2 class='my-3'>${title}</h2>
      <p class='text-muted'>${description}</p>
    </div>
  `;
};

// Load initial data from localStorage
const loadInitialData = () => {
  const localStorageCopy = JSON.parse(localStorage.getItem("task"));
  if (localStorageCopy && localStorageCopy.tasks) {
    state.taskList = localStorageCopy.tasks;
    displayTask();
  }
};

// Update local storage
const updateLocalStorage = () => {
  localStorage.setItem("task", JSON.stringify({ tasks: state.taskList }));
};

// Display tasks on UI
const displayTask = () => {
  taskContents.innerHTML = "";
  state.taskList.forEach((task) => {
    taskContents.insertAdjacentHTML("beforeend", htmlTaskContent(task));
  });
};

// Handle form submission
const handleSubmit = (event) => {
  event.preventDefault();

  const id = `${Date.now()}`;
  const input = {
    url: document.getElementById("imageUrl").value,
    title: document.getElementById("taskTitle").value,
    type: document.getElementById("tags").value,
    description: document.getElementById("taskDescription").value,
  };

  if (input.title === "" || input.type === "" || input.description === "") {
    return alert("Please fill all the necessary fields :-)");
  }

  state.taskList.push({ ...input, id });
  updateLocalStorage();
  displayTask();
  clearFormInputs();

  const modal = new bootstrap.Modal(document.getElementById("addNewModal"), {
    keyboard: false,
  });
  modal.hide();

  // Show success notification
  showNotification("New task added successfully!", "success");
};

// Open task
const openTask = (e) => {
  if (!e) e = window.event;

  const getTask = state.taskList.find(({ id }) => id === e.target.id);
  taskModal.innerHTML = htmlModalContent(getTask);
};

// Delete task
const deleteTask = (e) => {
  if (!e) e = window.event;

  const targetId = e.target.getAttribute("name");
  const targetType = e.target.tagName;

  // Remove task from state
  state.taskList = state.taskList.filter((task) => task.id !== targetId);
  updateLocalStorage();

  // Remove task from UI
  const removeTask = document.getElementById(targetId);
  removeTask.remove();

  // Show notification
  showNotification("Task deleted successfully!", "success");
};

// Edit task
const editTask = (e) => {
  if (!e) e = window.event;

  const targetId = e.target.id;
  const type = e.target.tagName;

  let parentNode;
  let taskTitle;
  let taskDescription;
  let taskType;
  let submitButton;

  if (type === "BUTTON") {
    parentNode = e.target.parentNode.parentNode;
  } else {
    parentNode = e.target.parentNode.parentNode.parentNode;
  }

  taskTitle = parentNode.childNodes[3].childNodes[3];
  taskDescription = parentNode.childNodes[3].childNodes[5];
  taskType = parentNode.childNodes[3].childNodes[7].childNodes[1];
  submitButton = parentNode.childNodes[5].childNodes[1];

  taskTitle.setAttribute("contenteditable", "true");
  taskDescription.setAttribute("contenteditable", "true");
  taskType.setAttribute("contenteditable", "true");

  submitButton.setAttribute("onclick", "saveEdit.apply(this, arguments)");
  submitButton.removeAttribute("data-bs-toggle");
  submitButton.removeAttribute("data-bs-target");
  submitButton.innerHTML = "Save Changes";
};

// Save edited task
const saveEdit = (e) => {
  if (!e) e = window.event;

  const targetId = e.target.id;
  const parentNode = e.target.parentNode.parentNode;

  const taskTitle = parentNode.childNodes[3].childNodes[3];
  const taskDescription = parentNode.childNodes[3].childNodes[5];
  const taskType = parentNode.childNodes[3].childNodes[7].childNodes[1];
  const submitButton = parentNode.childNodes[5].childNodes[1];

  const updateData = {
    title: taskTitle.innerHTML,
    description: taskDescription.innerHTML,
    type: taskType.innerHTML,
  };

  state.taskList = state.taskList.map((task) =>
    task.id === targetId ? { ...task, ...updateData } : task
  );

  updateLocalStorage();

  taskTitle.setAttribute("contenteditable", "false");
  taskDescription.setAttribute("contenteditable", "false");
  taskType.setAttribute("contenteditable", "false");

  submitButton.setAttribute("onclick", "openTask.apply(this, arguments)");
  submitButton.setAttribute("data-bs-toggle", "modal");
  submitButton.setAttribute("data-bs-target", "#showTask");
  submitButton.innerHTML = "Open Task";

  // Show success notification
  showNotification("Task updated successfully!", "success");
};

// Search tasks
const searchTask = (e) => {
  if (!e) e = window.event;

  while (taskContents.firstChild) {
    taskContents.removeChild(taskContents.firstChild);
  }

  const resultData = state.taskList.filter(({ title }) =>
    title.toLowerCase().includes(e.target.value.toLowerCase())
  );

  if (resultData.length > 0) {
    resultData.forEach((task) => {
      taskContents.insertAdjacentHTML("beforeend", htmlTaskContent(task));
    });
  } else {
    // No tasks found notification
    showNotification("No tasks found.", "info");
  }
};

// Clear form inputs
const clearFormInputs = () => {
  document.getElementById("imageUrl").value = "";
  document.getElementById("taskTitle").value = "";
  document.getElementById("tags").value = "";
  document.getElementById("taskDescription").value = "";
};

// Show notification
const showNotification = (message, type = "default") => {
  const timestamp = new Date().toLocaleString();
  const notificationItem = document.createElement("div");
  notificationItem.classList.add("notification-item");

  if (type === "success") {
    notificationItem.classList.add("notification-success");
  } else if (type === "error") {
    notificationItem.classList.add("notification-error");
  } else if (type === "info") {
    notificationItem.classList.add("notification-info");
  } else {
    notificationItem.classList.add("notification-default");
  }

  notificationItem.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-info-circle"></i>
    </div>
    <div class="notification-content">
      <div class="notification-message">${message}</div>
      <div class="notification-timestamp">${timestamp}</div>
    </div>
    <div class="notification-actions">
      <button class="dismiss-btn" onclick="dismissNotification(this)">Dismiss</button>
    </div>
  `;

  notificationList.appendChild(notificationItem);

  // Automatically remove the notification after 5 seconds
  setTimeout(() => {
    dismissNotification(notificationItem.querySelector(".dismiss-btn"));
  }, 5000);
};

// Dismiss notification
const dismissNotification = (element) => {
  const notificationItem = element.closest(".notification-item");
  notificationList.removeChild(notificationItem);
};

// Load initial data on page load
loadInitialData();
