class Utility {
  static formatDateTime(date = new Date()) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleString("sv-SE", options).replace(",", "");
  }
}

class Task {
  #title;
  #status;
  #startDate;
  #endDate;

  constructor(title, status = "todo") {
    this.title = title;
    this.status = status;
    this.#startDate = Utility.formatDateTime();
    this.#endDate = null;
  }

  get title() {
    return this.#title;
  }

  get status() {
    return this.#status;
  }

  get startDate() {
    return this.#startDate;
  }

  get endDate() {
    return this.#endDate;
  }

  set title(title) {
    if (!title) {
      throw new Error("Title must not be blank");
    }
    this.#title = title;
  }

  set status(status) {
    if (status !== "todo" && status !== "done") {
      throw new Error("Status can be only todo or done");
    }

    this.#status = status;

    if (status === "done") {
      this.#endDate = Utility.formatDateTime();
    } else {
      this.#endDate = null;
    }
  }

  set startDate(startDate) {
    this.#startDate = startDate;
  }

  set endDate(endDate) {
    this.#endDate = endDate;
  }
}

class TaskManager {
  #taskList = [];

  addTask(task) {
    if (!(task instanceof Task)) {
      throw new Error("Only instance of class Task can be added");
    }

    this.#taskList.push(task);
  }

  get allTasks() {
    return [...this.#taskList];
  }

  deleteTask(title) {
    this.#taskList = this.#taskList.filter((task) => task.title !== title);
  }

  findTask(title) {
    return this.#taskList.find((task) => task.title === title);
  }
}

class TodoUI {
  constructor(taskManager) {
    this.taskManager = taskManager;

    this.containter = document.querySelector(".list-group");
    this.submitButton = document.querySelector("form button[type='submit']");
    this.taskInput = document.querySelector("#taskInput");
    this.editingTask = null;
  }

  renderTasks() {
    this.containter.innerHTML = "";

    taskManager.allTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item border-0 mb-2 rounded p-0 d-flex align-items-center justify-content-between";

      li.innerHTML = `<label class="d-flex align-items-center flex-grow-1 p-3 m-0">
                        <input
                          class="form-check-input me-3"
                          type="checkbox"
                          ${task.status === "done" ? "checked" : ""}
                        />
                        <div class="d-flex flex-column">
                          <span class="todo-text ${task.status === "done" ? "text-decoration-line-through text-muted" : ""}">${task.title}</span>
                          <small class="text-muted mt-1">Created: ${task.startDate}
                          ${
                            task.status === "done"
                              ? `<span class="text-success ms-2">| Done: ${task.endDate}</span>`
                              : ""
                          } 
                          </small>
                         </div>
                      </label>`;
      li.innerHTML += `<div class="action-buttons d-flex pe-3">
                        <button
                          type="button"
                          class="btn btn-outline-warning btn-sm me-2 edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm delete-btn"
                        >
                          Delete
                        </button>
                      </div>`;

      const checkBox = li.querySelector(".form-check-input");
      const todoText = li.querySelector(".todo-text");
      const deleteButton = li.querySelector("button.delete-btn");
      const editButton = li.querySelector("button.edit-btn");
      const dateContent = li.querySelector("small.text-muted");
      const endDateContent =
        li.querySelector("small.text-muted span") ??
        document.createElement("span");

      checkBox.addEventListener("change", () => {
        if (checkBox.checked) {
          task.status = "done";
          todoText.classList.add(
            "text-decoration-line-through",
            "text-muted",
            "fw-medium",
          );

          endDateContent.className = "text-success ms-2";
          endDateContent.textContent = `| Done: ${task.endDate}`;
          dateContent.appendChild(endDateContent);
        } else {
          task.status = "todo";
          todoText.classList.remove(
            "text-decoration-line-through",
            "text-muted",
            "fw-medium",
          );
          endDateContent.remove();
        }
      });

      deleteButton.addEventListener("click", () => {
        this.resetForm();
        taskManager.deleteTask(task.title);
        this.renderTasks();
      });

      editButton.addEventListener("click", () => {
        this.editingTask = task;

        this.taskInput.value = task.title;
        this.submitButton.textContent = "SAVE";
        this.submitButton.className = "btn btn-warning text-white";

        this.taskInput.focus();
      });

      this.containter.appendChild(li);
    });
  }

  resetForm() {
    this.taskInput.value = "";
    this.submitButton.textContent = "ADD";
    this.submitButton.className = "btn btn-info text-white";
    this.editingTask = null;
  }

  renderAlert(message) {
    const alertComponent = document.createElement("div");
    alertComponent.className =
      "alert alert-warning position-fixed top-0 end-0 m-3 shadow fade show";
    alertComponent.style.zIndex = "1000";
    alertComponent.textContent = message;
    alertComponent.setAttribute("role", "alert");

    document.body.appendChild(alertComponent);

    setTimeout(() => {
      alertComponent.classList.remove("show");

      setTimeout(() => alertComponent.remove(), 150);
    }, 2000);
  }
}

const taskManager = new TaskManager();
const ui = new TodoUI(taskManager);
const todoForm = document.forms[0];

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskTitle = ui.taskInput.value.trim();

  try {
    if (ui.editingTask) {
      const isNameTaken = taskManager.findTask(taskTitle);
      const isNameChanged = ui.editingTask.title !== taskTitle;

      if (isNameChanged && isNameTaken) {
        ui.renderAlert(`Task with name: ${taskTitle} already exists`);
        return;
      }

      ui.editingTask.title = taskTitle;
    } else {
      if (taskManager.findTask(taskTitle)) {
        ui.renderAlert(`Task with name: ${taskTitle} already exists`);
        return;
      }

      taskManager.addTask(new Task(taskTitle));
    }

    ui.resetForm();
    ui.renderTasks();
  } catch (error) {
    ui.renderAlert(error.message);
  }
});
