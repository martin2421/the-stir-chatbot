import { useState } from 'react'
import './App.css'
import StateMachine from './StateMachine'


function App() {

  StateMachine();
  
  return (
        <div>
          <div id="chat-circle">
            <div className="chef" id="chef">
            <video id="logo-video" autoPlay loop muted playsInline>
              <source src="new_logo.gif" type="logo/gif"></source>
            </video>
            </div>
          </div>

          <div className="chat-box">
            <div className="chat-box-header">
              <span className="chat-box-toggle"><button className="material-icons">&times;</button></span>

              <p>Stir Food Assisstant</p>
              <button id="clearHistoryButton">&#x27f3;</button>

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
