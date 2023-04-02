import { useEffect, useRef, useState } from "react";
import deleteIcon from "./assets/delete.svg";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [listTitle, setListTitle] = useState("Hello");

  // Item reference
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const today = new Date();
    const title = `${today.toLocaleString("default", {
      weekday: "long",
    })}, ${today.getDate()} ${today.toLocaleString("default", {
      month: "short",
    })}`;
    setListTitle(title);

    fetchTasks();
  }, [tasks]);

  const fetchTasks = async () => {
    const data = await fetch(import.meta.env.VITE_END_POINT);
    const response = await data.json();
    setTasks(response.tasks);
  };

  const handleCheckboxChange = async (taskId, checked) => {
    await fetch(`${import.meta.env.VITE_END_POINT}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkedItemId: taskId,
        checked: !checked,
      }),
    });
  };

  const handleSort = async () => {
    await fetch(`${import.meta.env.VITE_END_POINT}/rearrange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dragItem: dragItem.current,
        dragOverItem: dragOverItem.current,
      }),
    });
  };

  const handleDelete = async (e, taskId) => {
    e.preventDefault();
    await fetch(`${import.meta.env.VITE_END_POINT}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkedItemId: taskId }),
    });
  };

  const handleNewTask = async (e) => {
    e.preventDefault();
    if (newTask === "") return;
    const data = await fetch(import.meta.env.VITE_END_POINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: newTask }),
    });
    const response = await data.json();
    setTasks(response.tasks);
    setNewTask("");
  };

  return (
    <div className="App">
      <div>
        <div className="box" id="heading">
          <h1>{listTitle}</h1>
        </div>

        <div className="box">
          {tasks.map((task, index) => (
            <form
              className="itemContainer"
              key={index}
              draggable
              onDragStart={() => {
                dragItem.current = task;
              }}
              onDragEnter={() => {
                dragOverItem.current = task;
              }}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              onSubmit={(e) => handleDelete(e, task._id)}
            >
              <div className="item">
                <input
                  type="checkbox"
                  name="checkbox"
                  value={task._id}
                  checked={task.checked}
                  onChange={() => handleCheckboxChange(task._id, task.checked)}
                />
                <p>{task.name}</p>
                <button type="submit">
                  <img src={deleteIcon} />
                </button>
              </div>
              <input type="hidden" name="listName" value="listTitle" />
            </form>
          ))}

          <form className="newItem" onSubmit={handleNewTask}>
            <input
              type="text"
              name="task"
              placeholder="New task"
              onChange={(e) => setNewTask(e.target.value)}
              value={newTask}
            />
            <button type="submit">+</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
