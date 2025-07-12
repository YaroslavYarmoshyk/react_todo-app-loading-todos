/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

type TodoStatus = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [visibleTodos, setVisibleTodos] = React.useState<Todo[]>([]);
  const [status, setStatus] = React.useState<TodoStatus>('all');
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleStatusChange = (newStatus: TodoStatus) => {
    setStatus(newStatus);

    let filteredTodos = todos;

    if (newStatus !== 'all') {
      filteredTodos = [...todos].filter(todo =>
        newStatus === 'completed' ? todo.completed : !todo.completed,
      );
    }

    setVisibleTodos(filteredTodos);
  };

  React.useEffect(() => {
    if (errorMessage) {
      const timeoutId = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }

    return () => {};
  }, [errorMessage]);

  React.useEffect(() => {
    if (!USER_ID) {
      return;
    }

    const fetchTodos = () => {
      setLoading(true);
      setErrorMessage('');

      const load = async () => {
        try {
          const loadedTodos = await getTodos();

          setTodos(loadedTodos);
          setVisibleTodos(loadedTodos);
        } catch {
          setErrorMessage('Unable to load todos');
        } finally {
          setLoading(false);
        }
      };

      load().catch(() => {});
    };

    fetchTodos();
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        {!loading &&
          visibleTodos.map(todo => (
            <section key={todo.id} className="todoapp__main" data-cy="TodoList">
              <div
                data-cy="Todo"
                className={classNames('todo', { completed: todo.completed })}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            </section>
          ))}

        {/* Hide the footer if there are no todos */}
        {!loading && todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${todos.filter(todo => !todo.completed).length} items left`}
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              {(['all', 'active', 'completed'] as TodoStatus[]).map(link => (
                <a
                  key={link}
                  href="#/"
                  className={classNames('filter__link', {
                    selected: status === link,
                  })}
                  data-cy={`FilterLink${link.charAt(0).toUpperCase()}${link.slice(1)}`}
                  onClick={() => handleStatusChange(link)}
                >
                  {link.charAt(0).toUpperCase() + link.slice(1)}
                </a>
              ))}
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={!todos.some(todo => todo.completed)}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
        {/*Unable to load todos*/}
        {/*<br />*/}
        {/*Title should not be empty*/}
        {/*<br />*/}
        {/*Unable to add a todo*/}
        {/*<br />*/}
        {/*Unable to delete a todo*/}
        {/*<br />*/}
        {/*Unable to update a todo*/}
      </div>
    </div>
  );
};
