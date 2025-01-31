import React from "react"
import ReactDOM from "react-dom/"
import App from "./App"
import store from "store/store"
import * as serviceWorker from "./serviceWorker"
import { Provider } from "react-redux"
import { BrowserRouter as Router } from "react-router-dom"
import initReactFastclick from "react-fastclick"
import "bootstrap/dist/css/bootstrap.min.css"
import "./override.css"
import HttpsRedirect from "react-https-redirect"
import * as Sentry from "@sentry/react"

initReactFastclick()

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN, // Replace with your Sentry DSN
  integrations: [new Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})


initReactFastclick()

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <HttpsRedirect>
        <App />
      </HttpsRedirect>
    </Router>
  </Provider>,
  document.getElementById("root"),
)

serviceWorker.register({
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting

    console.log('service worker event')
    if (waitingServiceWorker) {
      console.log('waiting service worker')
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          window.location.reload()
        }
      })
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" })
    }
  },
})
