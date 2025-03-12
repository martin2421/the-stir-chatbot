import { useState } from 'react'
import './App.css'
import StateMachine from './StateMachine'


function App() {

  StateMachine();
  
  return (
        <div>
          <div id="chat-circle">
  <div className="chef" id="chef">
    <img id="logo-image" src="new_logo.gif" alt="Logo" />
  </div>
</div>


          <div className="chat-box">
            <div className="chat-box-header">
              <span className="chat-box-toggle"><button className="material-icons">&#x2212;</button></span>
              <p style={{ fontWeight: "bold", fontSize: "23px" }}>The Stir Assistant</p>

             <button id="clearHistoryButton">
                <span className="fa">&#8634;</span>
                </button>
            </div>
            <div className="chat-box-body">
              <div className="chat-logs">
                <div id="messages"></div>
                <div id="button" className="buttons"></div>
              </div>
            </div>
          </div>
        </div>
  );
}

export default App;
