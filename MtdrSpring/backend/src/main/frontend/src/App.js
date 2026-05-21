/*
## MyToDoReact version 1.0.
##
## Copyright (c) 2022 Oracle, Inc.
## Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
*/
/*
 * This is the application main React component. We're using "function"
 * components in this application. No "class" components should be used for
 * consistency.
 * @author  jean.de.lavarene@oracle.com
 */
import React, { useState } from "react";

import Background from "./components/background/Background";
import HeaderStart from "./components/headerStart/headerStart";

import SideMenu from "./components/sideMenu/sideMenu";

import LoginView from "./views/login/LoginView";
import RegisterView from "./views/register/RegisterView";
import TaskDashboard from "./views/taskDashboard/taskDashboard";
import AnalyticsView from "./views/analytics/AnalyticsView";
import Notifications from "./views/notifications/notifications";

/* In this application we're using Function Components with the State Hooks
 * to manage the states. See the doc: https://reactjs.org/docs/hooks-state.html
 * This App component represents the entire app. It renders a NewItem component
 * and two tables: one that lists the todo items that are to be done and another
 * one with the items that are already done.
 */
function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [currView, setCurrView] = useState("login");
  const [user, setUser] = useState(null);

  function handleUserAfter(userData) {
    // Handle user data after registration
    setUser(userData);
    setAuthenticated(true);
    setCurrView("taskDashboard");
    console.log("Registered user data:", userData);
  }

  function handleNavigate(view) {
    setCurrView(view);
  }

  if (!isAuthenticated) {
    return (
      <>
        <HeaderStart vista={currView} onNavigate={handleNavigate} />
        <Background isAuthenticated={isAuthenticated}>
          {currView === "register" ? (
            <RegisterView
              onRegister={handleUserAfter}
              onBackToLogin={() => handleNavigate("login")}
            />
          ) : (
            <LoginView
              onLogin={handleUserAfter}
              onGoToRegister={() => handleNavigate("register")}
            />
          )}
        </Background>
      </>
    );
  }

  return (
    <Background isAuthenticated={isAuthenticated}>
      <SideMenu currentView={currView} onNavigate={handleNavigate}>
        {currView === "home" ? (
          <h1>Home</h1>
        ) : currView === "taskDashboard" ? (
          <TaskDashboard user={user} />
        ) : currView === "analytics" ? (
          <AnalyticsView user={user} />
        ) : currView === "notifications" ? (
          <Notifications />
        ) : currView === "team" ? (
          <main>
            <h1>Team</h1>
          </main>
        ) : currView === "profile" ? (
          <main>
            <h1>Profile</h1>
          </main>
        ) : (
          <TaskDashboard user={user} />
        )}
      </SideMenu>
    </Background>
  );
}
export default App;
