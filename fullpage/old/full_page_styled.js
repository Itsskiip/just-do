document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.querySelector('.task-list');
    const addTaskButton = document.getElementById('add-task');
  
    // Load tasks from storage and display them
    browser.storage.sync.get('tasks').then(data => {
      if (data.tasks) {
        data.tasks.forEach(task => {
          addTaskToDOM(task);
        });
      }
    });
  
    // Add task to the DOM
    function addTaskToDOM(task) {
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <div>
          <strong>${task.title}</strong>
          <p>${task.description}</p>
          <span class="due-date">Due Date: ${task.dueDate}</span>
          <span class="tags">Tags: ${task.tags}</span>
        </div>
      `;
      taskList.appendChild(li);
    }
  
    // Handle adding a new task
    addTaskButton.addEventListener('click', function () {
      const newTaskInput = document.getElementById('new-task');
      const newDueDateInput = document.getElementById('new-due-date');
      const newTagsInput = document.getElementById('new-tags');
  
      const newTask = {
        title: newTaskInput.value,
        description: '',
        dueDate: newDueDateInput.value,
        tags: newTagsInput.value,
        completed: false
      };
  
      browser.storage.sync.get('tasks').then(data => {
        const tasks = data.tasks || [];
        tasks.push(newTask);
        browser.storage.sync.set({ tasks }).then(() => {
          addTaskToDOM(newTask);
          newTaskInput.value = '';
          newDueDateInput.value = '';
          newTagsInput.value = '';
        });
      });
    });
  });
  